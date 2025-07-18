import express from 'express';
import { 
  getUserChats, 
  getOrCreateChat, 
  getChatMessages, 
  sendMessage, 
  deleteMessage, 
  getAvailableUsers,
  markChatAsRead,
  getTotalUnreadCount
} from '../controllers/chatController.js';

import { authenticate } from '../auth/verifyToken.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Get all chats for current user
router.get('/', getUserChats);

// Get users available for chat
router.get('/available-users', getAvailableUsers);

// Get total unread message count
router.get('/unread-count', getTotalUnreadCount);

// Get or create chat between users
router.post('/create', getOrCreateChat);

// Get messages for a specific chat
router.get('/:chatId/messages', getChatMessages);

// Send a message in a chat
router.post('/:chatId/messages', sendMessage);

// Delete a message
router.delete('/:chatId/messages/:messageId', deleteMessage);

// Mark chat as read
router.put('/:chatId/read', markChatAsRead);

export default router;
