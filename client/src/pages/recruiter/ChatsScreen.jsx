import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCheck,
  FaDollarSign,
  FaEllipsisV,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaSearch,
  FaUser,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllChatRoomsQuery,
  useGetAllMessagesFromChatRoomQuery,
  useGetChatRoomByIdQuery,
} from '../../features/chat/chatApi';

export default function RecruiterChatScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChatRooms, setFilteredChatRooms] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const messagesEndRef = useRef(null);

  const user = useSelector((state) => state.auth.userInfo);

  // Fetch all chat rooms
  const {
    data: chatRoomsData,
    isLoading: chatRoomsLoading,
    error: chatRoomsError,
  } = useGetAllChatRoomsQuery();

  // Fetch messages for selected chat room
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetAllMessagesFromChatRoomQuery(selectedChatRoom?.id, {
    skip: !selectedChatRoom,
  });

  // Fetch specific chat room details
  const { data: chatRoomData, isLoading: chatRoomLoading } =
    useGetChatRoomByIdQuery(selectedChatRoom?.id, { skip: !selectedChatRoom });

  // Filter chat rooms based on search term
  useEffect(() => {
    if (chatRoomsData?.chatRooms) {
      const filtered = chatRoomsData.chatRooms.filter((room) => {
        const interviewerName =
          `${room.interviewer.firstName} ${room.interviewer.lastName}`.toLowerCase();
        const jobTitle = room.job.title.toLowerCase();
        const search = searchTerm.toLowerCase();

        return interviewerName.includes(search) || jobTitle.includes(search);
      });
      setFilteredChatRooms(filtered);
    }
  }, [chatRoomsData, searchTerm]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track page view for analytics
  useEffect(() => {
    trackPageView('/recruiter/chats');
  }, []);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData]);

  const handleChatRoomClick = (chatRoom) => {
    setSelectedChatRoom(chatRoom);
    trackEvent(
      'Chat Selection',
      'User Action',
      `User selected chat with: ${chatRoom.interviewer.firstName} ${chatRoom.interviewer.lastName}`
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      // Note: Actual message sending functionality would be implemented here
      // with a backend API call to send the message

      // Reset message input
      setMessageInput('');

      trackEvent(
        'Message Sent',
        'User Action',
        `Message sent in chat: ${selectedChatRoom.id}`
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatRoomList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-secondary dark:text-dark-secondary" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatRoomsLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader />
          </div>
        ) : chatRoomsError ? (
          <div className="p-4">
            <Alert
              message={
                chatRoomsError?.data?.message || 'Error loading chat rooms'
              }
            />
          </div>
        ) : filteredChatRooms && filteredChatRooms.length > 0 ? (
          filteredChatRooms.map((chatRoom) => (
            <div
              key={chatRoom.id}
              onClick={() => handleChatRoomClick(chatRoom)}
              className={`p-4 border-b border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background cursor-pointer transition-all duration-200 animate-fadeIn ${
                selectedChatRoom?.id === chatRoom.id
                  ? 'bg-light-primary bg-opacity-10 border-l-4 border-light-primary dark:border-dark-primary'
                  : ''
              }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20 flex items-center justify-center">
                    <FaUser className="text-light-primary dark:text-dark-primary text-lg" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-light-text dark:text-dark-text">
                      {chatRoom.interviewer.firstName}{' '}
                      {chatRoom.interviewer.lastName}
                    </h3>
                    <span className="text-xs text-light-text dark:text-dark-text opacity-60">
                      {getLastActive(chatRoom.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs bg-light-secondary bg-opacity-10 text-light-secondary dark:text-dark-secondary px-2 py-0.5 rounded-full">
                      {chatRoom.job.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-light-text dark:text-dark-text opacity-70">
              No chats found
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderJobDetails = () => {
    if (!chatRoomData?.chatRoom?.job) return null;

    const job = chatRoomData.chatRoom.job;

    return (
      <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg mt-4">
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2 flex items-center">
          <FaBriefcase className="mr-2 text-light-primary dark:text-dark-primary" />
          Job Details
        </h3>
        <h4 className="font-medium text-light-text dark:text-dark-text">
          {job.title}
        </h4>
        {job.location && (
          <p className="text-sm text-light-text dark:text-dark-text mt-1 flex items-center">
            <FaMapMarkerAlt className="mr-1 text-light-primary dark:text-dark-primary" />
            {job.location}
          </p>
        )}
        {job.salaryRange && (
          <div className="mt-2 flex items-center">
            <FaDollarSign className="mr-1 text-light-primary dark:text-dark-primary" />
            <span className="text-sm text-light-text dark:text-dark-text">
              {job.salaryRange}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderInterviewerDetails = () => {
    if (!chatRoomData?.chatRoom?.interviewer) return null;

    const interviewer = chatRoomData.chatRoom.interviewer;

    return (
      <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg mt-4">
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2 flex items-center">
          <FaUser className="mr-2 text-light-primary dark:text-dark-primary" />
          Interviewer Details
        </h3>
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20 flex items-center justify-center">
            <FaUser className="text-light-primary dark:text-dark-primary" />
          </div>
          <div className="ml-2">
            <h4 className="font-medium text-light-text dark:text-dark-text">
              {interviewer.firstName} {interviewer.lastName}
            </h4>
            <p className="text-xs text-light-text dark:text-dark-text opacity-60">
              Interviewer
            </p>
          </div>
        </div>
        {interviewer.email && (
          <p className="text-sm text-light-text dark:text-dark-text mt-1">
            {interviewer.email}
          </p>
        )}
      </div>
    );
  };

  const renderChatMessages = () => {
    if (!selectedChatRoom) {
      return (
        <div className="h-full flex items-center justify-center bg-light-surface dark:bg-dark-surface rounded-lg">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-light-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-light-primary dark:text-dark-primary text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              Select a conversation
            </h3>
            <p className="text-light-text dark:text-dark-text opacity-60">
              Choose a chat to start messaging with interviewers
            </p>
          </div>
        </div>
      );
    }

    if (messagesLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader />
        </div>
      );
    }

    if (messagesError) {
      return (
        <div className="h-full flex items-center justify-center">
          <Alert
            message={messagesError?.data?.message || 'Error loading messages'}
          />
        </div>
      );
    }

    const messages = messagesData?.messages || [];

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-light-primary bg-opacity-20 dark:bg-dark-primary dark:bg-opacity-20 flex items-center justify-center">
                <FaUser className="text-light-primary dark:text-dark-primary" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-light-text dark:text-dark-text">
                {selectedChatRoom.interviewer?.firstName}{' '}
                {selectedChatRoom.interviewer?.lastName}
              </h3>
              <p className="text-xs text-light-text dark:text-dark-text opacity-60">
                {selectedChatRoom.job?.title || 'Interview discussion'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 hover:bg-light-background dark:hover:bg-dark-background rounded-full">
              <FaEllipsisV className="text-light-text dark:text-dark-text opacity-60" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isCurrentUser =
                message.senderId === user.id ||
                (message.recruiter && message.recruiter.id === user.id);

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isCurrentUser
                        ? 'bg-light-primary dark:bg-dark-primary text-white'
                        : 'bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        isCurrentUser
                          ? 'text-white text-opacity-70'
                          : 'text-light-text dark:text-dark-text opacity-60'
                      } flex items-center`}
                    >
                      {formatTimestamp(message.createdAt)}
                      {isCurrentUser && message.isRead && (
                        <FaCheck className="ml-1 text-xs" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-light-text dark:text-dark-text opacity-50">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 rounded-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className={`p-2 rounded-full ${
                messageInput.trim()
                  ? 'bg-light-primary dark:bg-dark-primary text-white'
                  : 'bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text opacity-50'
              }`}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Recruiter Chat - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Chat - Connect and communicate with interviewers for your job postings."
        />
        <meta
          name="keywords"
          content="recruiter chat, messaging, interviewer communication, job interviews, hiring"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="max-w-7xl w-full mx-auto animate-slideUp">
          <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-6">
            <span className="text-light-primary dark:text-dark-primary">
              Conversations
            </span>{' '}
            with Interviewers
          </h1>

          {chatRoomsLoading ? (
            <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
              <Loader />
            </div>
          ) : chatRoomsError ? (
            <Alert
              message={chatRoomsError?.data?.message || 'Error loading chats'}
            />
          ) : isMobile ? (
            <div className="rounded-lg overflow-hidden border border-light-border dark:border-dark-border animate-slideUp">
              {selectedChatRoom ? (
                <div className="h-[80vh]">
                  {renderChatMessages()}
                  <button
                    onClick={() => setSelectedChatRoom(null)}
                    className="mt-4 px-4 py-2 bg-light-background dark:bg-dark-background rounded border border-light-border dark:border-dark-border text-light-text dark:text-dark-text"
                  >
                    Back to chats
                  </button>
                </div>
              ) : (
                <div className="h-[80vh] bg-light-surface dark:bg-dark-surface">
                  {renderChatRoomList()}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6 h-[80vh] animate-slideUp">
              <div className="col-span-3 bg-light-surface dark:bg-dark-surface rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                {renderChatRoomList()}
              </div>

              <div className="col-span-6 bg-light-surface dark:bg-dark-surface rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                {renderChatMessages()}
              </div>

              <div className="col-span-3 space-y-4">
                {chatRoomLoading ? (
                  <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border flex items-center justify-center">
                    <Loader />
                  </div>
                ) : selectedChatRoom ? (
                  <>
                    {renderInterviewerDetails()}
                    {renderJobDetails()}
                  </>
                ) : (
                  <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-light-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-light-primary dark:text-dark-primary text-xl" />
                      </div>
                      <p className="text-light-text dark:text-dark-text opacity-60">
                        Select a chat to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
