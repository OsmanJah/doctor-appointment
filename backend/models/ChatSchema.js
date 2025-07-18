import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Doctor'],
    default: function() {
      return this.senderRole === 'doctor' ? 'Doctor' : 'User';
    }
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'readBy.userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Doctor']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Doctor'],
      default: function() {
        return this.role === 'doctor' ? 'Doctor' : 'User';
      }
    },
    role: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Link to appointment if chat is related to a specific appointment
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  chatType: {
    type: String,
    enum: ['appointment', 'general'],
    default: 'general'
  },
  
  messages: [messageSchema],
  
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // For tracking unread messages per participant
  unreadCount: {
    type: Map,
    of: Number,
    default: () => new Map()
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ appointment: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ 'messages.sender': 1 });
chatSchema.index({ 'messages.createdAt': -1 });

// Virtual for getting other participant (for 1-on-1 chats)
chatSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(p => p.user.toString() !== currentUserId.toString());
};

// Method to add message
chatSchema.methods.addMessage = function(senderId, senderRole, content, messageType = 'text', fileUrl = null, fileName = null) {
  const message = {
    sender: senderId,
    senderModel: senderRole === 'doctor' ? 'Doctor' : 'User',
    senderRole,
    content,
    messageType,
    fileUrl,
    fileName,
    readBy: [{ 
      user: senderId, 
      userModel: senderRole === 'doctor' ? 'Doctor' : 'User',
      readAt: new Date() 
    }]
  };
  
  this.messages.push(message);
  this.lastMessage = {
    content: content,
    sender: senderId,
    timestamp: new Date()
  };
  
  // Update unread count for other participants
  this.participants.forEach(participant => {
    // Extract the actual user ID (handle both ObjectId and populated user object)
    const participantUserId = participant.user._id ? participant.user._id.toString() : participant.user.toString();
    
    if (participantUserId !== senderId.toString()) {
      const currentCount = this.unreadCount.get(participantUserId) || 0;
      this.unreadCount.set(participantUserId, currentCount + 1);
    }
  });
  
  return this.messages[this.messages.length - 1];
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  const unreadMessages = this.messages.filter(msg => 
    !msg.readBy.some(read => read.user.toString() === userId.toString())
  );
  
  // Find the participant to determine their userModel
  const participant = this.participants.find(p => 
    p.user._id ? p.user._id.toString() === userId.toString() : p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    console.error('Participant not found when marking as read');
    return 0;
  }
  
  const userModel = participant.userModel || (participant.role === 'doctor' ? 'Doctor' : 'User');
  
  unreadMessages.forEach(msg => {
    msg.readBy.push({ 
      user: userId, 
      userModel: userModel,
      readAt: new Date() 
    });
  });
  
  // Reset unread count for this user
  this.unreadCount.set(userId.toString(), 0);
  
  return unreadMessages.length;
};

// Method to recalculate unread counts after message deletion
chatSchema.methods.recalculateUnreadCounts = function() {
  // Reset all unread counts
  this.participants.forEach(participant => {
    const participantUserId = participant.user._id ? participant.user._id.toString() : participant.user.toString();
    this.unreadCount.set(participantUserId, 0);
  });
  
  // Count unread messages for each participant
  this.messages.forEach(message => {
    if (!message.isDeleted) {
      this.participants.forEach(participant => {
        const participantUserId = participant.user._id ? participant.user._id.toString() : participant.user.toString();
        const messageReadBy = message.readBy.some(read => read.user.toString() === participantUserId);
        
        if (!messageReadBy && message.sender.toString() !== participantUserId) {
          const currentCount = this.unreadCount.get(participantUserId) || 0;
          this.unreadCount.set(participantUserId, currentCount + 1);
        }
      });
    }
  });
};

// Static method to find or create chat between two users
chatSchema.statics.findOrCreateChat = async function(user1Id, user1Role, user2Id, user2Role, appointmentId = null) {
  console.log('=== findOrCreateChat ===');
  console.log('Looking for chat between:', {
    user1: { id: user1Id, role: user1Role },
    user2: { id: user2Id, role: user2Role }
  });
  
  let chat = await this.findOne({
    $and: [
      { 'participants.user': user1Id },
      { 'participants.user': user2Id }
    ]
  }).populate('participants.user', 'name email role photo specialization');
  
  console.log('Existing chat found:', chat ? { id: chat._id, participants: chat.participants.length } : 'NONE');
  
  if (!chat) {
    console.log('Creating new chat...');
    chat = new this({
      participants: [
        { 
          user: user1Id, 
          role: user1Role,
          userModel: user1Role === 'doctor' ? 'Doctor' : 'User'
        },
        { 
          user: user2Id, 
          role: user2Role,
          userModel: user2Role === 'doctor' ? 'Doctor' : 'User'
        }
      ],
      appointment: appointmentId,
      chatType: appointmentId ? 'appointment' : 'general'
    });
    
    await chat.save();
    console.log('New chat saved, populating participants...');
    
    // Populate with dynamic refs
    await chat.populate([
      {
        path: 'participants.user',
        select: 'name email role photo specialization'
      }
    ]);
    
    console.log('Chat populated successfully');
  }
  
  console.log('Returning chat:', chat ? { id: chat._id, participants: chat.participants.length } : 'NULL');
  return chat;
};

// Method to get chat list for a user
chatSchema.statics.getChatListForUser = async function(userId) {
  const chats = await this.find({
    'participants.user': userId,
    isActive: true
  })
  .populate('participants.user', 'name email role photo specialization')
  .populate('appointment', 'appointmentDateTime status comment')
  .sort({ updatedAt: -1 });
  
  return chats;
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
