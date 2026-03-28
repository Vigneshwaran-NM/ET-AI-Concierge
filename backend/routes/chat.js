const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getChats,
    getChatById,
    createChat,
    renameChat,
    deleteChat,
    addMessage,
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChatById);
router.put('/:id/title', renameChat);
router.delete('/:id', deleteChat);
router.post('/:id/messages', addMessage);

module.exports = router;
