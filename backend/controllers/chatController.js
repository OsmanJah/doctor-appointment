import Chat from '../models/ChatSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import { getIO } from '../socket.js';

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const chats = await Chat.getChatListForUser(userId);
    
    // Format chat data for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.getOtherParticipant(userId);
      const unreadCount = chat.unreadCount.get(userId.toString()) || 0;
      
      return {
        _id: chat._id,
        otherParticipant: {
          _id: otherParticipant.user._id,
          name: otherParticipant.user.name,
          photo: otherParticipant.user.photo,
          role: otherParticipant.role,
          specialization: otherParticipant.user.specialization || null
        },
        lastMessage: chat.lastMessage,
        unreadCount,
        appointment: chat.appointment,
        chatType: chat.chatType,
        updatedAt: chat.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedChats
    });
    
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chats'
    });
  }
};

// Get or create chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId, appointmentId } = req.body;
    
    console.log('Creating chat between:', userId, 'and', otherUserId);
    
    // Get current user info - check both User and Doctor collections
    let currentUser = await User.findById(userId);
    if (!currentUser) {
      currentUser = await Doctor.findById(userId);
      if (currentUser) {
        currentUser.role = 'doctor';
      }
    }
    
    console.log('Current user found:', currentUser ? { id: currentUser._id, role: currentUser.role, name: currentUser.name } : 'NOT FOUND');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }
    
    // Get other user info - check both User and Doctor collections
    let otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      otherUser = await Doctor.findById(otherUserId);
      if (otherUser) {
        otherUser.role = 'doctor';
      }
    }
    
    console.log('Other user found:', otherUser ? { id: otherUser._id, role: otherUser.role, name: otherUser.name } : 'NOT FOUND');
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Other user not found'
      });
    }
    
    // Validate that one is patient and other is doctor
    if (currentUser.role === otherUser.role) {
      return res.status(400).json({
        success: false,
        message: 'Chat can only be created between patient and doctor'
      });
    }
    
    // If appointmentId is provided, validate it
    if (appointmentId) {
      const appointment = await Booking.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Check if user is involved in the appointment
      const isInvolved = appointment.user.toString() === userId || 
                        appointment.doctor.toString() === userId;
      
      if (!isInvolved) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to create chat for this appointment'
        });
      }
    }
    
    console.log('Creating chat with participants:', {
      user1: { id: userId, role: currentUser.role },
      user2: { id: otherUserId, role: otherUser.role }
    });
    
    const chat = await Chat.findOrCreateChat(
      userId,
      currentUser.role,
      otherUserId,
      otherUser.role,
      appointmentId
    );
    
    console.log('Chat created/found:', chat ? { id: chat._id, participants: chat.participants.length } : 'FAILED');
    
    res.status(200).json({
      success: true,
      data: chat
    });
    
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'name email role photo specialization')
      .populate('messages.sender', 'name photo role');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this chat'
      });
    }
    
    // Mark messages as read
    const unreadCount = chat.markAsRead(userId);
    await chat.save();
    
    // Paginate messages (newest first)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const messages = chat.messages
      .filter(msg => !msg.isDeleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, endIndex)
      .reverse(); // Reverse to show oldest first in the current page
    
    res.status(200).json({
      success: true,
      data: {
        chat: {
          _id: chat._id,
          participants: chat.participants,
          appointment: chat.appointment,
          chatType: chat.chatType
        },
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chat.messages.filter(msg => !msg.isDeleted).length,
          hasMore: endIndex < chat.messages.length
        },
        unreadCount
      }
    });
    
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    const { content, messageType = 'text', fileUrl = null, fileName = null } = req.body;
    
    console.log('=== sendMessage ===');
    console.log('User ID:', userId);
    console.log('Chat ID:', chatId);
    console.log('Content:', content);
    
    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required'
      });
    }
    
    // Get current user info - check both User and Doctor collections
    let currentUser = await User.findById(userId);
    if (!currentUser) {
      currentUser = await Doctor.findById(userId);
      if (currentUser) {
        currentUser.role = 'doctor';
      }
    }
    
    console.log('Current user found:', currentUser ? { id: currentUser._id, role: currentUser.role, name: currentUser.name } : 'NOT FOUND');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'name email role photo');
    
    console.log('Chat found:', chat ? { id: chat._id, participants: chat.participants.length } : 'NOT FOUND');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user._id.toString() === userId);
    console.log('Is participant:', isParticipant);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this chat'
      });
    }
    
    // Add message to chat
    console.log('Adding message to chat...');
    const message = chat.addMessage(
      userId,
      currentUser.role,
      content,
      messageType,
      fileUrl,
      fileName
    );
    
    await chat.save();
    console.log('Message saved successfully');
    
    // Populate the message sender info
    await chat.populate('messages.sender', 'name photo role');
    const populatedMessage = chat.messages[chat.messages.length - 1];
    
    console.log('Populated message:', populatedMessage);
    
    // Emit to other participants via Socket.IO
    try {
      const io = getIO();
      const otherParticipants = chat.participants.filter(p => p.user._id.toString() !== userId);
      
      console.log('Emitting to other participants:', otherParticipants.length);
      
      otherParticipants.forEach(participant => {
        const targetUserId = participant.user._id.toString();
        console.log('Emitting newMessage to user:', targetUserId);
        
        // Emit to both user room and chat room
        io.to(targetUserId).emit('newMessage', {
          chatId: chat._id,
          message: populatedMessage,
          sender: {
            _id: currentUser._id,
            name: currentUser.name,
            photo: currentUser.photo,
            role: currentUser.role
          }
        });
        
        // Also emit to chat room
        io.to(`chat_${chat._id}`).emit('newMessage', {
          chatId: chat._id,
          message: populatedMessage,
          sender: {
            _id: currentUser._id,
            name: currentUser.name,
            photo: currentUser.photo,
            role: currentUser.role
          }
        });
      });
    } catch (socketErr) {
      console.error('Socket emit failed:', socketErr.message);
    }
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId, messageId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }
    
    // Soft delete the message
    message.isDeleted = true;
    message.content = 'This message has been deleted';
    
    // Recalculate unread counts after deletion
    chat.recalculateUnreadCounts();
    
    await chat.save();
    
    // Emit to other participants via Socket.IO
    try {
      const io = getIO();
      const otherParticipants = chat.participants.filter(p => p.user._id.toString() !== userId);
      
      otherParticipants.forEach(participant => {
        const participantUserId = participant.user._id.toString();
        const updatedUnreadCount = chat.unreadCount.get(participantUserId) || 0;
        
        io.to(participantUserId).emit('messageDeleted', {
          chatId: chat._id,
          messageId: messageId,
          updatedUnreadCount: updatedUnreadCount
        });
      });
    } catch (socketErr) {
      console.error('Socket emit failed:', socketErr.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Get users available for chat (doctors for patients, patients for doctors)
export const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('getAvailableUsers called for userId:', userId);
    
    // First, check if user exists in User collection
    let currentUser = await User.findById(userId);
    
    // If not found in User collection, check Doctor collection
    if (!currentUser) {
      currentUser = await Doctor.findById(userId);
      if (currentUser) {
        currentUser.role = 'doctor'; // Ensure role is set
      }
    }
    
    console.log('Current user found:', currentUser ? { id: currentUser._id, role: currentUser.role, name: currentUser.name } : 'NOT FOUND');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let availableUsers = [];
    
    if (currentUser.role === 'patient') {
      console.log('Fetching doctors for patient...');
      
      // For patients, show ALL doctors (from Doctor collection)
      const doctors = await Doctor.find({})
        .select('name email photo specialization averageRating totalRating bio ticketPrice');
      console.log('Doctors found in Doctor collection:', doctors.length);
      
      availableUsers = doctors.map(doctor => ({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        photo: doctor.photo,
        specialization: doctor.specialization,
        averageRating: doctor.averageRating,
        totalRating: doctor.totalRating,
        bio: doctor.bio,
        ticketPrice: doctor.ticketPrice,
        role: 'doctor'
      }));
      
    } else if (currentUser.role === 'doctor') {
      console.log('Fetching patients for doctor...');
      
      // For doctors, show ALL patients (from User collection)
      const patients = await User.find({ role: 'patient' })
        .select('name email photo gender bloodType');
      console.log('Patients found in User collection:', patients.length);
      
      availableUsers = patients.map(patient => ({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        photo: patient.photo,
        gender: patient.gender,
        bloodType: patient.bloodType,
        role: 'patient'
      }));
    }
    
    console.log('Final available users count:', availableUsers.length);
    console.log('Available users sample:', availableUsers.slice(0, 2));
    
    res.status(200).json({
      success: true,
      data: availableUsers
    });
    
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available users'
    });
  }
};

// Mark chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this chat'
      });
    }
    
    const unreadCount = chat.markAsRead(userId);
    await chat.save();
    
    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
    
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark chat as read'
    });
  }
};

// Get total unread message count for user
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    
    const chats = await Chat.getChatListForUser(userId);
    
    let totalUnreadCount = 0;
    chats.forEach(chat => {
      const unreadCount = chat.unreadCount.get(userId.toString()) || 0;
      totalUnreadCount += unreadCount;
    });
    
    res.status(200).json({
      success: true,
      data: { totalUnreadCount }
    });
    
  } catch (error) {
    console.error('Get total unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};
