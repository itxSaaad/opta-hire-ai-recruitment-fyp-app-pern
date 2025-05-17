const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createChatRoom,
  getAllChatRooms,
  getChatRoomById,
  deleteChatRoom,
  createMessage,
  getAllMessagesFromChatRoom,
} = require('../controllers/chatRoom.controller');

const router = Router();

router
  .route('/')
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer'),
    createChatRoom
  )
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
    getAllChatRooms
  );

router
  .route('/:id')
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
    getChatRoomById
  )
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteChatRoom);

router
  .route('/:id/messages')
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer'),
    getAllMessagesFromChatRoom
  )
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer'),
    createMessage
  );

module.exports = router;
