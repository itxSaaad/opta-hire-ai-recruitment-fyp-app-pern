const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const { ChatRoom, Job, Message, User } = require('../models');

const { validateString } = require('../utils/validation.utils');

/**
 * @desc Creates a Chat Room
 *
 * @route POST /api/v1/chat-rooms
 * @access Private (Recruiters, Interviewers)
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If Interviewer ID or Job ID is not provided
 * @throws {Error} If Job with the provided ID does not exist
 * @throws {Error} If User with the provided ID does not exist
 * @throws {Error} If Chat Room could not be created
 */

const createChatRoom = asyncHandler(async (req, res) => {
  const { interviewerId, jobId } = req.body;

  if (!interviewerId || !jobId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please provide both an interviewer and job to create a chat room.'
    );
  }

  const job = await Job.findByPk(jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found. Please check and try again.');
  }

  const interviewer = await User.findByPk(interviewerId);

  if (!interviewer) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interviewer not found. Please check and try again.');
  }

  const chatRoom = await ChatRoom.create({
    jobId,
    interviewerId,
    recruiterId: job.recruiterId,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Chat room created successfully',
    chatRoom,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all Chat Rooms
 *
 * @route GET /api/v1/chat-rooms
 * @access Private (Recruiters, Interviewers, Admins)
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If no chat rooms are found
 * @throws {Error} If no chat rooms are found for the user
 * @throws {Error} If no chat rooms are found for the recruiter
 * @throws {Error} If no chat rooms are found for the interviewer
 *
 */

const getAllChatRooms = asyncHandler(async (req, res) => {
  const { role, jobId, interviewerId, recruiterId } = req.query;
  let whereClause = {};

  if (role) {
    switch (role) {
      case 'recruiter':
        whereClause.recruiterId = req.user.id;
        break;
      case 'interviewer':
        whereClause.interviewerId = req.user.id;
        break;
    }
  }

  if (jobId) {
    whereClause.jobId = jobId;
  }

  if (interviewerId) {
    whereClause.interviewerId = interviewerId;
  }

  if (recruiterId) {
    whereClause.recruiterId = recruiterId;
  }

  const chatRooms = await ChatRoom.findAll({
    where: whereClause,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: Message,
        as: 'messages',
        attributes: ['id'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  if (!chatRooms || chatRooms.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No chat rooms available matching the criteria');
  }

  const chatRoomsWithMessageCount = chatRooms.map((room) => ({
    ...room.toJSON(),
    messageCount: room.messages.length,
  }));

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat rooms fetched successfully',
    count: chatRooms.length,
    chatRooms: chatRoomsWithMessageCount,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get a Chat Room by ID
 *
 * @route GET /api/v1/chat-rooms/:id
 * @access Private (Recruiters, Interviewers, Admins)
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If Chat Room ID is invalid
 * @throws {Error} If Chat Room with the provided ID does not exist
 *
 */

const getChatRoomById = asyncHandler(async (req, res) => {
  const chatRoomId = req.params.id;

  if (!validateString(chatRoomId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid chat room ID provided. Please try again.');
  }

  const chatRoom = await ChatRoom.findByPk(chatRoomId, {
    include: [
      {
        model: Job,
        attributes: ['title'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Chat room not found. Please check the ID and try again.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat room details loaded successfully',
    chatRoom,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete a Chat Room by ID
 *
 * @route DELETE /api/v1/chat-rooms/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If Chat Room ID is invalid
 * @throws {Error} If Chat Room with the provided ID does not exist
 * @throws {Error} If Chat Room with the provided ID could not be deleted
 *
 */

const deleteChatRoom = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findByPk(req.params.id);

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Chat room not found. Please check and try again later.');
  }

  const deletedChatRoom = await chatRoom.destroy();

  if (!deletedChatRoom) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Chat room could not be deleted. Please try again later.');
  }

  const [interviewer, job] = await Promise.all([
    User.findByPk(chatRoom.interviewerId),
    Job.findByPk(chatRoom.jobId),
  ]);

  const recruiter = await User.findByPk(job.recruiterId);

  const emailContent = [
    {
      type: 'text',
      value: `This chat room has been permanently removed from the system.`,
    },
    { type: 'heading', value: 'Chat Room Details' },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Recruiter: ${recruiter.firstName} ${recruiter.lastName}`,
        `Created At: ${new Date(chatRoom.createdAt).toLocaleString()}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Chat Room Deleted',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Chat Room Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: recruiter.email,
      subject: 'OptaHire - Chat Room Deleted',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Chat Room Deleted',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Chat room deleted but email could not be delivered.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat room has been successfully deleted',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all Messages from a Chat Room
 *
 * @route GET /api/v1/chat-rooms/:id/messages
 * @access Private (Recruiters, Interviewers)
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If Chat Room ID is invalid
 * @throws {Error} If Chat Room with the provided ID does not exist
 * @throws {Error} If no messages are found in the chat room
 * @throws {Error} If messages could not be retrieved
 * @throws {Error} If no messages are found in this chat room
 */

const getAllMessagesFromChatRoom = asyncHandler(async (req, res) => {
  const chatRoomId = req.params.id;

  if (!validateString(chatRoomId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide a valid chat room ID to load messages.');
  }

  const chatRoom = await ChatRoom.findByPk(chatRoomId);

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Chat room not found. Please check and try again.');
  }

  const messages = await Message.findAll({
    where: {
      chatRoomId,
    },
    include: [
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: ChatRoom,
        as: 'chatRoom',
        attributes: ['id'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  if (!messages || messages.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No messages available in this chat room yet.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat messages loaded successfully',
    count: messages.length,
    messages,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createChatRoom,
  getAllChatRooms,
  getChatRoomById,
  deleteChatRoom,
  getAllMessagesFromChatRoom,
};
