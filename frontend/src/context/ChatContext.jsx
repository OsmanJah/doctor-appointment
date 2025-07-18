import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from '../config';
import { useAuthContext } from './AuthContext';

const ChatContext = createContext();

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  totalUnreadCount: 0,
  unreadCount: 0,
  isConnected: false,
  socket: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    hasMore: true
  }
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'SET_CHATS':
      const totalUnread = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
      return { ...state, chats: action.payload, totalUnreadCount: totalUnread, loading: false };
      
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
      
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: action.payload.messages,
        pagination: action.payload.pagination,
        loading: false 
      };
      
    case 'ADD_MESSAGE':
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some(msg => msg._id === action.payload._id);
      if (messageExists) {
        return state;
      }
      
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        chats: state.chats.map(chat =>
          chat._id === action.payload.chatId || 
          (state.currentChat && chat._id === state.currentChat._id)
            ? { ...chat, lastMessage: action.payload }
            : chat
        )
      };
      
    case 'SET_TOTAL_UNREAD_COUNT':
      return { ...state, totalUnreadCount: action.payload };
      
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload._id ? action.payload : msg
        )
      };
      
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload.messageId 
            ? { ...msg, isDeleted: true, content: 'This message has been deleted' }
            : msg
        )
      };
      
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
      
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
      
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
      
    case 'UPDATE_USER_ONLINE_STATUS':
      return {
        ...state,
        onlineUsers: state.onlineUsers.map(user =>
          user.userId === action.payload.userId
            ? { ...user, isOnline: action.payload.isOnline }
            : user
        )
      };
      
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };
      
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: [...state.typingUsers.filter(u => u.userId !== action.payload.userId), action.payload]
      };
      
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.userId !== action.payload.userId)
      };
      
    case 'UPDATE_UNREAD_COUNT':
      const updatedChats = state.chats.map(chat =>
        chat._id === action.payload.chatId
          ? { ...chat, unreadCount: action.payload.count }
          : chat
      );
      const newTotalUnread = updatedChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
      return {
        ...state,
        chats: updatedChats,
        totalUnreadCount: newTotalUnread,
        unreadCount: newTotalUnread
      };
      
    case 'LOAD_MORE_MESSAGES':
      return {
        ...state,
        messages: [...action.payload.messages, ...state.messages],
        pagination: action.payload.pagination
      };
      
    case 'RESET_CHAT':
      return {
        ...state,
        currentChat: null,
        messages: [],
        pagination: { page: 1, limit: 50, hasMore: true }
      };
      
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, token } = useAuthContext();

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      console.log('Initializing socket connection for user:', user.name);
      const socket = io(BASE_URL.replace('/api/v1', ''), {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log('Chat socket connected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        
        // Join user's personal room
        socket.emit('join', { userId: user._id });
        
        // Fetch initial unread count
        fetchTotalUnreadCount();
      });

      socket.on('disconnect', () => {
        console.log('Chat socket disconnected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      });

      socket.on('newMessage', (data) => {
        console.log('Received new message via socket:', data);
        dispatch({ type: 'ADD_MESSAGE', payload: data.message });
        
        // Update unread count if not in current chat
        if (!state.currentChat || state.currentChat._id !== data.chatId) {
          // Fetch updated unread count
          fetchTotalUnreadCount();
        }
      });

      socket.on('messageDeleted', (data) => {
        dispatch({ type: 'DELETE_MESSAGE', payload: data });
        
        // Update unread count if provided
        if (data.updatedUnreadCount !== undefined) {
          dispatch({ 
            type: 'UPDATE_UNREAD_COUNT', 
            payload: { 
              chatId: data.chatId, 
              count: data.updatedUnreadCount 
            }
          });
        }
        
        // Fetch updated total unread count
        fetchTotalUnreadCount();
      });

      socket.on('userTyping', (data) => {
        if (data.isTyping) {
          dispatch({ type: 'ADD_TYPING_USER', payload: data });
          
          // Auto-remove typing indicator after 3 seconds
          setTimeout(() => {
            dispatch({ type: 'REMOVE_TYPING_USER', payload: data });
          }, 3000);
        } else {
          dispatch({ type: 'REMOVE_TYPING_USER', payload: data });
        }
      });

      socket.on('userOnlineStatus', (data) => {
        dispatch({ type: 'UPDATE_USER_ONLINE_STATUS', payload: data });
      });

      socket.on('messageReadReceipt', (data) => {
        dispatch({ type: 'UPDATE_MESSAGE', payload: data });
      });

      dispatch({ type: 'SET_SOCKET', payload: socket });

      return () => {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      };
    }
  }, [user, token]);

  // Fetch total unread count
  const fetchTotalUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BASE_URL}/chats/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_TOTAL_UNREAD_COUNT', payload: data.data.totalUnreadCount });
      }
    } catch (error) {
      console.error('Fetch total unread count error:', error);
    }
  }, [token]);

  // Fetch chats
  const fetchChats = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_CHATS', payload: data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Create or get chat
  const createOrGetChat = async (otherUserId, appointmentId = null) => {
    try {
      console.log('=== createOrGetChat ===');
      console.log('Creating chat with:', { otherUserId, appointmentId });
      console.log('Token:', token);
      
      const response = await fetch(`${BASE_URL}/chats/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId, appointmentId })
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create chat');
      }
    } catch (error) {
      console.error('createOrGetChat error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  };

  // Fetch messages for a chat
  const fetchMessages = async (chatId, page = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' }); // Clear any previous errors
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        console.log(`Fetching messages for chat ${chatId}, attempt ${attempts}`);
        console.log('Token available:', !!token);
        console.log('User available:', !!user);
        
        const response = await fetch(`${BASE_URL}/chats/${chatId}/messages?page=${page}&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          if (page === 1) {
            dispatch({ type: 'SET_MESSAGES', payload: data.data });
          } else {
            dispatch({ type: 'LOAD_MORE_MESSAGES', payload: data.data });
          }
          dispatch({ type: 'SET_LOADING', payload: false });
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch messages');
        }
      } catch (error) {
        console.error(`Fetch messages attempt ${attempts} failed:`, error);
        
        if (attempts < maxAttempts) {
          console.log(`Retrying in ${attempts * 500}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempts * 500));
        } else {
          dispatch({ type: 'SET_ERROR', payload: error.message });
          dispatch({ type: 'SET_LOADING', payload: false });
          throw error;
        }
      }
    }
  };

  // Send message
  const sendMessage = async (chatId, content, messageType = 'text', fileUrl = null, fileName = null) => {
    try {
      console.log('=== sendMessage ===');
      console.log('Sending message:', { chatId, content, messageType });
      
      const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, messageType, fileUrl, fileName })
      });
      
      console.log('Send message response status:', response.status);
      
      const data = await response.json();
      console.log('Send message response data:', data);
      
      if (data.success) {
        // Don't add message to state here - let Socket.IO handle it to avoid duplicates
        return data.data;
      } else {
        console.error('Send message failed:', data.message);
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (error) {
      console.error('Send message error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Delete message
  const deleteMessage = async (chatId, messageId) => {
    try {
      const response = await fetch(`${BASE_URL}/chats/${chatId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'DELETE_MESSAGE', payload: { messageId } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Join chat room
  const joinChat = (chatId) => {
    if (state.socket) {
      state.socket.emit('joinChat', { chatId });
    }
  };

  // Leave chat room
  const leaveChat = (chatId) => {
    if (state.socket) {
      state.socket.emit('leaveChat', { chatId });
    }
  };

  // Send typing indicator
  const sendTyping = (chatId, isTyping) => {
    if (state.socket) {
      state.socket.emit('typing', { chatId, isTyping });
    }
  };

  // Mark chat as read
  const markChatAsRead = async (chatId) => {
    try {
      const response = await fetch(`${BASE_URL}/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'UPDATE_UNREAD_COUNT', payload: { chatId, count: 0 } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Set current chat
  const setCurrentChat = (chat) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
    if (chat) {
      joinChat(chat._id);
      markChatAsRead(chat._id);
    }
  };

  // Clear current chat
  const clearCurrentChat = () => {
    if (state.currentChat) {
      leaveChat(state.currentChat._id);
    }
    dispatch({ type: 'RESET_CHAT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchChats,
    fetchTotalUnreadCount,
    createOrGetChat,
    fetchMessages,
    sendMessage,
    deleteMessage,
    setCurrentChat,
    clearCurrentChat,
    joinChat,
    leaveChat,
    sendTyping,
    markChatAsRead,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
