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
  .get(protectServer, getAllChatRooms);

router
  .route('/:id')
  .get(protectServer, getChatRoomById)
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteChatRoom);

router.route('/:id/messages').get(protectServer, getAllMessagesFromChatRoom);

module.exports = router;
