const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { ChatRoom, Job, Message, User } = require('../models');

const { validateString } = require('../utils/validation.utils');

/**
 * @desc Creates a Chat Room
 *
 * @route POST /api/v1/chatrooms
 * @access Private (Recruiters & Interviewers)
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
    throw new Error('Please provide an Interviewer ID and a Job ID');
  }

  const job = await Job.findByPk(jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`Job with ID ${jobId} does not exist`);
  }

  const interviewer = await User.findByPk(interviewerId);

  if (!interviewer) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`User with ID ${interviewerId} does not exist`);
  }

  const chatRoom = await ChatRoom.create({
    jobId,
    interviewerId,
    recruiterId: job.recruiterId,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Chat Room created successfully',
    chatRoom,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all Chat Rooms
 *
 * @route GET /api/v1/chatrooms
 * @access Private
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
  let whereClause = {};

  if (req.user.isRecruiter) {
    whereClause = {
      recruiterId: req.user.id,
    };
  } else if (req.user.isInterviewer) {
    whereClause = {
      interviewerId: req.user.id,
    };
  } else if (req.user.isAdmin) {
    whereClause = {};
  }

  const chatRooms = await ChatRoom.findAll({
    where: whereClause,
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

  if (!chatRooms || chatRooms.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No chat rooms found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat Rooms retrieved successfully',
    count: chatRooms.length,
    chatRooms,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get a Chat Room by ID
 *
 * @route GET /api/v1/chatrooms/:id
 * @access Private
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
    throw new Error('Chat Room ID is invalid');
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
    throw new Error(`Chat Room with ID ${chatRoomId} does not exist`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Chat Room retrieved successfully',
    chatRoom,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete a Chat Room by ID
 *
 * @route DELETE /api/v1/chatrooms/:id
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
  const chatRoomId = req.params.id;

  if (!validateString(chatRoomId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Chat Room ID is invalid');
  }

  const chatRoom = await ChatRoom.findByPk(chatRoomId);

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`Chat Room with ID ${chatRoomId} does not exist`);
  }

  const deletedChatRoom = await ChatRoom.destroy({
    where: {
      id: chatRoomId,
    },
  });

  if (!deletedChatRoom) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Chat Room with ID ${chatRoomId} could not be deleted`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Chat Room with ID ${chatRoomId} deleted successfully`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all Messages from a Chat Room
 *
 * @route GET /api/v1/chatrooms/:id/messages
 * @access Private
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
    throw new Error('Chat Room ID is invalid');
  }

  const chatRoom = await ChatRoom.findByPk(chatRoomId);

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`Chat Room with ID ${chatRoomId} does not exist`);
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
    throw new Error('No messages found in this chat room');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Messages retrieved successfully',
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
