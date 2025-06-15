import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft,
  FaBriefcase,
  FaDollarSign,
  FaEllipsisV,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaUser,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

import {
  useCreateMessageMutation,
  useGetAllChatRoomsQuery,
  useGetAllMessagesFromChatRoomQuery,
  useGetChatRoomByIdQuery,
} from '../../features/chat/chatApi';

import { useCreateContractMutation } from '../../features/contract/contractApi';

// Helper function to format time
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const MOBILE_BREAKPOINT = 768;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function ChatsScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );
  const [showChat, setShowChat] = useState(false); // For mobile navigation
  const [showContractModal, setShowContractModal] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const user = useSelector((state) => state.auth.userInfo);
  const { accessToken } = useSelector((state) => state.auth);

  // API queries
  const {
    data: roomsData,
    isLoading: roomsLoading,
    error: roomsError,
  } = useGetAllChatRoomsQuery({
    role: user.isRecruiter ? 'recruiter' : 'interviewer',
  });

  const {
    data: messagesData,
    isLoading: msgsLoading,
    error: msgsError,
  } = useGetAllMessagesFromChatRoomQuery(selectedRoom?.id, {
    skip: !selectedRoom,
  });

  const {
    data: roomDetails,
    isLoading: roomLoading,
    error: roomError,
  } = useGetChatRoomByIdQuery(selectedRoom?.id, { skip: !selectedRoom });

  // Mutations
  const [createMessage] = useCreateMessageMutation();
  const [createContract, { isLoading: contractLoading }] =
    useCreateContractMutation();

  // Initialize socket connection
  useEffect(() => {
    const token = accessToken;

    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    const newSocket = io(`${SERVER_URL}/chat`, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat socket');
      setSocket(newSocket);
      setIsConnected(true);

      // Join room if one is selected
      if (selectedRoom) {
        newSocket.emit('join-room', selectedRoom.id);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      if (selectedRoom) {
        newSocket.emit('leave-room', selectedRoom.id);
      }
      newSocket.disconnect();
    };
  }, [accessToken, selectedRoom]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Socket event handlers
    socket.on('room-joined', (data) => {
      console.log('Room joined successfully:', data);
      if (data.success) {
        setParticipants(data.data.participants);
      }
    });

    socket.on('new-message', (data) => {
      if (data.success && data.data) {
        console.log('New message received:', data.data);
        setMessages((prev) => [...prev, data.data]);
      }
    });

    socket.on('user-typing', (data) => {
      if (data.success && data.data) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.data.userId]: {
            firstName: data.data.firstName,
            isTyping: data.data.isTyping,
          },
        }));
      }
    });

    socket.on('user-joined', (data) => {
      if (data.success && data.data) {
        console.log('User joined:', data.data);
        setParticipants((prev) => [...prev, data.data]);
      }
    });

    socket.on('user-left', (data) => {
      if (data.success && data.data) {
        console.log('User left:', data.data);
        setParticipants((prev) =>
          prev.filter((p) => p.userId !== data.data.userId)
        );

        // Remove from typing indicators
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[data.data.userId];
          return updated;
        });
      }
    });

    socket.on('messages-read', (data) => {
      if (data.success && data.data) {
        console.log('Messages read by:', data.data.userId);
        // Mark messages as read
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user.id && !msg.isRead
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    });

    socket.on('contract-created', (data) => {
      if (data.success && data.data) {
        console.log('Contract created:', data.data.contract);
      }
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
    });

    return () => {
      socket.off('room-joined');
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('messages-read');
      socket.off('contract-created');
      socket.off('error');
    };
  }, [socket, user.id]);

  // Join room when selected room changes
  useEffect(() => {
    if (socket && isConnected && selectedRoom) {
      // Leave previous room if any
      if (selectedRoom.previousId) {
        socket.emit('leave-room', selectedRoom.previousId);
      }

      // Join new room
      socket.emit('join-room', selectedRoom.id);

      // Clear messages when switching rooms
      setMessages([]);
    }
  }, [socket, isConnected, selectedRoom]);

  // Update messages when fetched from API
  useEffect(() => {
    if (messagesData?.messages && selectedRoom) {
      setMessages(messagesData.messages);

      // Mark messages as read
      if (socket && isConnected) {
        socket.emit('mark-read', { roomId: selectedRoom.id });
      }
    }
  }, [messagesData, selectedRoom, socket, isConnected]);

  // Responsive handling
  useEffect(() => {
    const onResize = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(newIsMobile);
      if (!newIsMobile) setShowChat(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const messagesChanged = messages.length > prevMessagesLengthRef.current;
    if (
      messagesEndRef.current &&
      messages.length > 0 &&
      (messagesChanged || selectedRoom)
    ) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }

    // Update the previous messages length reference
    prevMessagesLengthRef.current = messages.length;
  }, [messages, selectedRoom]);

  // Focus input when selecting a chat
  useEffect(() => {
    if (selectedRoom && !isMobile) {
      messageInputRef.current?.focus();
    }
  }, [selectedRoom, isMobile]);

  // Set mobile view when selecting a room
  useEffect(() => {
    if (selectedRoom && isMobile) {
      setShowChat(true);
    }
  }, [selectedRoom, isMobile]);

  // Reset message input when changing rooms
  useEffect(() => {
    setMessageInput('');
  }, [selectedRoom]);

  useEffect(() => {
    if (messageInputRef.current && isTyping) {
      messageInputRef.current.focus();
    }
  }, [isTyping, messageInput]);

  // Filter rooms
  const rooms = roomsData?.chatRooms || [];
  const filtered = rooms.filter((r) => {
    const name = user.isRecruiter
      ? `${r.interviewer.firstName} ${r.interviewer.lastName}`.toLowerCase()
      : `${r.recruiter.firstName} ${r.recruiter.lastName}`.toLowerCase();
    const title = r.job.title.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase())
    );
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || !selectedRoom || !socket || !isConnected) return;

    try {
      // Clear typing indicator
      handleTypingStop();

      // Send via socket
      socket.emit('send-message', {
        roomId: selectedRoom.id,
        content: trimmedMessage,
      });

      // Clear input
      setMessageInput('');

      // Fallback: API call if socket fails or is slow
      try {
        await createMessage({
          chatRoomId: selectedRoom.id,
          content: trimmedMessage,
        }).unwrap();
      } catch (error) {
        console.error('API fallback for message creation failed:', error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleSelectRoom = (room) => {
    // If selecting a different room, update the selection with previous id
    if (selectedRoom?.id !== room.id) {
      setSelectedRoom({
        ...room,
        previousId: selectedRoom?.id,
      });
    }

    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Handle typing indicator
    if (!isTyping && selectedRoom && socket && isConnected) {
      setIsTyping(true);
      socket.emit('typing', {
        roomId: selectedRoom.id,
        isTyping: true,
      });
    }

    // Clear previous timeout
    clearTimeout(typingTimeoutRef.current);

    // Set new timeout using ref
    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
  };

  const handleTypingStop = () => {
    if (isTyping && selectedRoom && socket && isConnected) {
      setIsTyping(false);
      socket.emit('typing', {
        roomId: selectedRoom.id,
        isTyping: false,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  };

  const handleCreateContract = async () => {
    if (
      !selectedRoom ||
      !agreedPrice ||
      isNaN(parseFloat(agreedPrice)) ||
      parseFloat(agreedPrice) <= 0
    ) {
      return;
    }

    try {
      // Send via socket
      if (socket && isConnected) {
        socket.emit('create-contract', {
          roomId: selectedRoom.id,
          agreedPrice: parseFloat(agreedPrice),
        });
      }

      setShowContractModal(false);
      setAgreedPrice('');

      // Fallback API call
      try {
        await createContract({
          jobId: selectedRoom.jobId,
          interviewerId: selectedRoom.interviewerId,
          recruiterId: selectedRoom.recruiterId,
          agreedPrice: parseFloat(agreedPrice),
          roomId: selectedRoom.id,
        }).unwrap();
      } catch (error) {
        // API fallback failed, but socket might have succeeded
        console.error('API fallback for contract creation failed:', error);
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
      setError('Failed to create contract. Please try again.');
    }
  };

  // === Sub‑components ===
  const RoomList = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-light-border p-3 dark:border-dark-border">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-light-primary dark:text-dark-primary" />
          <input
            type="text"
            placeholder="Search jobs or interviewers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-light-border bg-light-surface py-4 pl-12 pr-4 text-light-text transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filtered.length ? (
          filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRoom(r)}
              className={`flex w-full items-center gap-3 p-3 text-left transition hover:bg-light-surface dark:hover:bg-dark-surface ${
                selectedRoom?.id === r.id
                  ? 'border-l-4 border-light-primary bg-light-primary bg-opacity-10 dark:border-dark-primary dark:bg-dark-primary dark:bg-opacity-10'
                  : ''
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20">
                <FaUser className="text-light-primary dark:text-dark-primary" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium text-light-text dark:text-dark-text">
                    {user.isRecruiter
                      ? `${r.interviewer.firstName} ${r.interviewer.lastName}`
                      : `${r.recruiter.firstName} ${r.recruiter.lastName}`}
                  </span>
                  <span className="text-xs text-light-text/60 dark:text-dark-text/60">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="truncate text-sm text-light-text/70 dark:text-dark-text/70">
                  {r.job.title}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-light-text opacity-60 dark:text-dark-text">
            No chats found.
          </div>
        )}
      </div>
    </div>
  );

  const MessagesPane = () => {
    if (!selectedRoom) {
      return (
        <div className="flex h-full items-center justify-center text-light-text opacity-50 dark:text-dark-text">
          Select a chat to start messaging.
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      );
    }

    if (msgsLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      );
    }

    // Show typing indicators
    const typingUserIds = Object.keys(typingUsers).filter(
      (id) => typingUsers[id].isTyping
    );
    const typingUserNames = typingUserIds
      .map((id) => typingUsers[id].firstName)
      .filter(Boolean);

    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-light-border p-3 dark:border-dark-border">
          <div className="flex items-center gap-3">
            {isMobile && showChat && (
              <button
                onClick={handleBackToList}
                className="mr-1 rounded-full p-2 hover:bg-light-background dark:hover:bg-dark-background"
              >
                <FaArrowLeft className="text-light-primary dark:text-dark-primary" />
              </button>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20">
              <FaUser className="text-light-primary dark:text-dark-primary" />
            </div>

            <div className="flex flex-col">
              <div className="font-medium text-light-text dark:text-dark-text">
                {user.isRecruiter
                  ? `${roomDetails?.chatRoom?.interviewer?.firstName || ''} ${roomDetails?.chatRoom?.interviewer?.lastName || ''}`
                  : `${roomDetails?.chatRoom?.recruiter?.firstName || ''} ${roomDetails?.chatRoom?.recruiter?.lastName || ''}`}
              </div>
              <div className="text-xs text-light-text/70 dark:text-dark-text/70">
                {roomDetails?.chatRoom?.job?.title || ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.isRecruiter && (
              <button
                onClick={() => setShowContractModal(true)}
                className="flex items-center gap-1 rounded-md bg-light-primary p-2 text-sm text-white transition-opacity hover:opacity-90 dark:bg-dark-primary dark:text-dark-text"
              >
                <FaPlus size={12} /> Contract
              </button>
            )}
            <button className="rounded-full p-2 hover:bg-light-background dark:hover:bg-dark-background">
              <FaEllipsisV className="text-light-text dark:text-dark-text/60" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-auto p-3">
          {messages.length > 0 ? (
            messages.map((m) => {
              const me = m.senderId === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${me ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 ${
                      me
                        ? 'rounded-b-lg rounded-tl-lg bg-light-primary text-dark-text dark:bg-dark-primary'
                        : 'rounded-b-lg rounded-tr-lg bg-light-secondary text-dark-text dark:bg-dark-secondary'
                    } ${m.messageType === 'contract' ? 'border-2 border-green-500' : ''}`}
                  >
                    <p className="break-words">{m.content}</p>
                    <div
                      className={`mt-1 flex justify-end text-xs ${
                        me ? 'text-dark-text/70' : 'text-dark-text/60'
                      }`}
                    >
                      {formatTime(m.createdAt)}
                      {m.isRead && me && <span className="ml-1">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-light-text opacity-50 dark:text-dark-text">
              No messages found. Start a conversation!
            </div>
          )}

          {/* Typing indicator */}
          {typingUserNames.length > 0 && (
            <div className="flex items-center text-xs italic text-light-text/70 dark:text-dark-text/70">
              {typingUserNames.join(', ')}{' '}
              {typingUserNames.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="sticky bottom-0 flex items-center gap-2 border-t border-light-border bg-light-surface p-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleInputChange}
            onBlur={handleTypingStop}
            className="flex-1 rounded-lg border border-light-border bg-light-background p-3 text-light-text transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-background dark:text-dark-text dark:focus:ring-dark-primary"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !isConnected}
            className={`flex items-center justify-center rounded-lg p-3 transition-all duration-300 ${
              messageInput.trim() && isConnected
                ? 'bg-light-primary text-white hover:bg-light-primary/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80'
                : 'cursor-not-allowed bg-light-border text-light-text/50 dark:bg-dark-border dark:text-dark-text/50'
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    );
  };

  const DetailsPane = () => {
    if (!selectedRoom) return null;
    if (roomLoading) return <Loader />;
    if (!roomDetails?.chatRoom) return null;

    const { job, interviewer } = roomDetails.chatRoom;

    return (
      <div className="h-full overflow-y-auto p-3">
        {/* Job Info */}
        <div className="rounded-lg bg-light-background p-4 dark:bg-dark-background">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-light-primary dark:text-dark-primary">
            <FaBriefcase /> Job Details
          </h3>
          <div>
            <div className="font-medium text-light-text dark:text-dark-text">
              {job.title}
            </div>
            <div className="flex items-center gap-1 text-sm text-light-text/70 dark:text-dark-text/70">
              <FaMapMarkerAlt /> {job.location}
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-light-text/70 dark:text-dark-text/70">
              <FaDollarSign /> {job.salaryRange}
            </div>
          </div>
        </div>

        {/* Interviewer */}
        <div className="rounded-lg bg-light-background p-4 dark:bg-dark-background">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-light-primary dark:text-dark-primary">
            <FaUser /> Interviewer
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20">
              <FaUser className="text-light-primary dark:text-dark-primary" />
            </div>
            <div>
              <div className="font-medium text-light-text dark:text-dark-text">
                {interviewer.firstName} {interviewer.lastName}
              </div>
              <div className="text-sm text-light-text/70 dark:text-dark-text/70">
                {interviewer.email}
              </div>
            </div>
          </div>
        </div>

        {/* Create Contract Button (for recruiters) */}
        {user.isRecruiter && (
          <div className="rounded-lg bg-light-background p-4 dark:bg-dark-background">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-light-primary dark:text-dark-primary">
              <FaBriefcase /> Contract
            </h3>
            <button
              onClick={() => setShowContractModal(true)}
              className="mt-2 w-full rounded-md bg-light-primary py-2 text-white transition-opacity hover:opacity-90 dark:bg-dark-primary dark:text-dark-text"
            >
              Create Contract
            </button>
          </div>
        )}

        {/* Participants */}
        <div className="rounded-lg bg-light-background p-4 dark:bg-dark-background">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-light-primary dark:text-dark-primary">
            <FaUser /> Participants
          </h3>
          <div className="space-y-2">
            {participants.map((p, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-light-border p-2 dark:border-dark-border"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20">
                    <FaUser
                      className="text-light-primary dark:text-dark-primary"
                      size={12}
                    />
                  </div>
                  <span className="text-sm text-light-text dark:text-dark-text">
                    {p.firstName} {p.lastName}
                  </span>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Contract Modal
  const ContractModal = () => (
    <Modal
      isOpen={showContractModal}
      onClose={() => setShowContractModal(false)}
      title="Create Contract"
    >
      <div className="p-4">
        <p className="mb-4 text-light-text dark:text-dark-text">
          Create a contract with {selectedRoom?.interviewer?.firstName}{' '}
          {selectedRoom?.interviewer?.lastName} for the job:{' '}
          {selectedRoom?.job?.title}
        </p>

        <div className="mb-4">
          <label
            htmlFor="agreedPrice"
            className="mb-1 block text-sm font-medium text-light-text dark:text-dark-text"
          >
            Agreed Price ($)
          </label>
          <input
            type="number"
            id="agreedPrice"
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(e.target.value)}
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-light-border bg-light-surface p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
            placeholder="Enter agreed price"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowContractModal(false)}
            className="rounded-md bg-light-secondary px-4 py-2 text-light-text transition-opacity hover:opacity-90 dark:bg-dark-secondary dark:text-dark-text"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateContract}
            disabled={
              !agreedPrice ||
              isNaN(parseFloat(agreedPrice)) ||
              parseFloat(agreedPrice) <= 0 ||
              contractLoading ||
              !isConnected
            }
            className={`rounded-md px-4 py-2 text-white ${
              !agreedPrice ||
              isNaN(parseFloat(agreedPrice)) ||
              parseFloat(agreedPrice) <= 0 ||
              !isConnected
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-light-primary transition-opacity hover:opacity-90 dark:bg-dark-primary'
            }`}
          >
            {contractLoading ? 'Creating...' : 'Create Contract'}
          </button>
        </div>
      </div>
    </Modal>
  );

  // === Layout ===
  return (
    <>
      <Helmet>
        <title>Messages - OptaHire | Connect with Top Interviewers</title>
        <meta
          name="description"
          content="Connect with professional interviewers on OptaHire. Discuss requirements, negotiate contracts, and streamline your hiring process."
        />
        <meta
          name="keywords"
          content="OptaHire Recruiter Messages, Interviewer Communication, Professional Interviews, Contract Negotiations, Hiring Support"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-8 dark:bg-dark-background md:py-16 lg:py-24">
        {roomsLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Messages &{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Collaboration
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Connect with professional interviewers and streamline your hiring
              process through effective communication.
            </p>

            {(roomsError || roomError || msgsError || error) && (
              <Alert
                message={
                  roomsError?.data?.message ||
                  roomError?.data?.message ||
                  msgsError?.data?.message ||
                  error ||
                  'An error occurred'
                }
              />
            )}

            <div
              className={`grid ${
                isMobile ? 'grid-cols-1' : 'grid-cols-12'
              } h-[70vh] gap-4 md:h-[80vh]`}
            >
              {/* Rooms */}
              <div
                className={`${isMobile && showChat ? 'hidden' : ''} ${
                  isMobile ? 'col-span-1' : 'col-span-3'
                } overflow-hidden rounded-lg border border-light-border bg-light-surface shadow-sm dark:border-dark-border dark:bg-dark-surface`}
              >
                <RoomList />
              </div>

              {/* Messages */}
              <div
                className={`${isMobile && !showChat ? 'hidden' : ''} ${
                  isMobile ? 'col-span-1' : 'col-span-6'
                } overflow-hidden rounded-lg border border-light-border bg-light-surface shadow-sm dark:border-dark-border dark:bg-dark-surface`}
              >
                <MessagesPane />
              </div>

              {/* Details */}
              <div
                className={`${
                  isMobile ? 'hidden' : 'col-span-3'
                } overflow-hidden rounded-lg border border-light-border bg-light-surface shadow-sm dark:border-dark-border dark:bg-dark-surface`}
              >
                <DetailsPane />
              </div>
            </div>
          </div>
        )}

        {/* Contract Modal */}
        <ContractModal />
      </section>
    </>
  );
}
