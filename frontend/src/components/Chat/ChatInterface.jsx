import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useAuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import { formatDate } from '../../utils/formatDate';
import { 
  FaPaperPlane, 
  FaArrowLeft,
  FaCircle,
  FaTrash,
  FaUserMd,
  FaUser,
  FaSearch
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ChatInterface = () => {
  const { user, token, role } = useAuthContext();
  const {
    chats,
    currentChat,
    messages,
    typingUsers,
    isConnected,
    loading,
    error,
    fetchChats,
    createOrGetChat,
    fetchMessages,
    sendMessage,
    deleteMessage,
    setCurrentChat,
    clearCurrentChat,
    sendTyping,
    markChatAsRead,
    clearError
  } = useChatContext();

  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load available users on component mount
  useEffect(() => {
    console.log('=== ChatInterface useEffect ===');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('User from localStorage:', localStorage.getItem('user'));
    console.log('Role from localStorage:', localStorage.getItem('role'));
    console.log('Token exists:', !!token);
    
    if (user && token) {
      // Add a small delay to ensure auth state is stable
      const timeoutId = setTimeout(() => {
        fetchAvailableUsers();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('Missing user or token, not fetching users');
    }
  }, [user, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (currentChat && messageInput.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(currentChat._id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        if (currentChat) {
          sendTyping(currentChat._id, false);
        }
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, currentChat, isTyping]);

  // Fetch available users based on current user's role
  const fetchAvailableUsers = async (retryCount = 0) => {
    if (!user || !token) return;

    try {
      // Use the chat available-users endpoint for both patients and doctors
      const endpoint = 'chats/available-users';
      
      const userRole = user?.role || role;
      console.log('Fetching users for role:', userRole, 'from endpoint:', endpoint);
      console.log('User object:', user);
      
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        setAvailableUsers(data.data || []);
      } else {
        console.error('Failed to fetch available users, status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        
        // If it's a 401 (unauthorized) and we haven't retried yet, try again after a short delay
        if (response.status === 401 && retryCount < 2) {
          console.log(`Retrying fetchAvailableUsers (attempt ${retryCount + 1})`);
          setTimeout(() => fetchAvailableUsers(retryCount + 1), 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      
      // Retry on network errors
      if (retryCount < 2) {
        console.log(`Retrying fetchAvailableUsers after network error (attempt ${retryCount + 1})`);
        setTimeout(() => fetchAvailableUsers(retryCount + 1), 1000);
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(userItem => {
    const name = userItem.name?.toLowerCase() || '';
    const email = userItem.email?.toLowerCase() || '';
    const specialization = userItem.specialization?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || specialization.includes(query);
  });

  // Handle user selection to start chat
  const handleUserSelect = async (selectedUser) => {
    console.log('=== handleUserSelect ===');
    console.log('Selected user:', selectedUser);
    console.log('Current user:', user);
    
    // Clear any existing errors
    clearError();
    
    try {
      const chat = await createOrGetChat(selectedUser._id);
      console.log('Chat created/retrieved:', chat);
      
      if (chat) {
        setCurrentChat(chat);
        setSelectedChat(chat);
        setShowUserList(false);
        
        // Fetch messages for the selected chat
        if (chat._id) {
          // Add a small delay to ensure state is updated
          setTimeout(async () => {
            try {
              await fetchMessages(chat._id);
              await markChatAsRead(chat._id);
            } catch (error) {
              console.error('Error fetching messages:', error);
              // Error will be handled by the fetchMessages function
            }
          }, 100);
        }
      } else {
        console.error('Chat creation returned null');
        toast.error('Failed to create chat - no chat returned');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat: ' + error.message);
    }
  };

  // Handle back to user list
  const handleBackToUserList = () => {
    setShowUserList(true);
    setSelectedChat(null);
    clearCurrentChat();
  };

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentChat) return;

    try {
      await sendMessage(currentChat._id, messageInput.trim());
      setMessageInput('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    if (!currentChat || !messageId) return;

    try {
      await deleteMessage(currentChat._id, messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get other participant in the chat
  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants || !user) return null;
    
    const participant = chat.participants.find(p => p.user._id !== user._id);
    return participant?.user || null;
  };

  // Render individual message
  const renderMessage = (message) => {
    const isOwn = message.sender === user._id;
    const otherParticipant = getOtherParticipant(selectedChat);
    
    return (
      <div
        key={message._id}
        className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
            {otherParticipant?.photo ? (
              <img
                src={otherParticipant.photo}
                alt={otherParticipant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primaryColor flex items-center justify-center">
                {user?.role === 'patient' ? (
                  <FaUserMd className="text-white text-xs" />
                ) : (
                  <FaUser className="text-white text-xs" />
                )}
              </div>
            )}
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primaryColor text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          
          <div className={`mt-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatDate(message.createdAt)}
            {isOwn && (
              <button
                onClick={() => handleDeleteMessage(message._id)}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render user list
  const renderUserList = () => {
    console.log('=== renderUserList ===');
    console.log('User role in render:', user?.role);
    console.log('Role from context:', role);
    console.log('Available users length:', availableUsers.length);
    console.log('Available users sample:', availableUsers.slice(0, 2));
    
    // Use role from context if user.role is not available
    const userRole = user?.role || role;
    console.log('Final userRole:', userRole);
    
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-primaryColor text-white p-4">
          <h2 className="text-xl font-bold">
            {userRole === 'patient' ? 'Available Doctors' : 'Available Patients'}
          </h2>
          <p className="text-sm opacity-90">
            Select a {userRole === 'patient' ? 'doctor' : 'patient'} to start messaging
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${userRole === 'patient' ? 'doctors' : 'patients'}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center space-x-3"
                  onClick={() => handleUserSelect(userItem)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {userItem.photo ? (
                        <img
                          src={userItem.photo}
                          alt={userItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primaryColor flex items-center justify-center">
                          {userRole === 'patient' ? (
                            <FaUserMd className="text-white text-lg" />
                          ) : (
                            <FaUser className="text-white text-lg" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{userItem.name}</h3>
                    <p className="text-sm text-gray-500">{userItem.email}</p>
                    {userRole === 'patient' && userItem.specialization && (
                      <p className="text-sm text-primaryColor">{userItem.specialization}</p>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center">
                    <FaCircle className="text-green-500 text-xs" />
                    <span className="ml-1 text-xs text-gray-500">Online</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>No {userRole === 'patient' ? 'doctors' : 'patients'} found</p>
              {searchQuery && (
                <p className="text-sm mt-2">Try adjusting your search</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render chat messages
  const renderMessages = () => (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <button
          onClick={handleBackToUserList}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        
        {selectedChat && (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {getOtherParticipant(selectedChat)?.photo ? (
                <img
                  src={getOtherParticipant(selectedChat).photo}
                  alt={getOtherParticipant(selectedChat).name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primaryColor flex items-center justify-center">
                  {user?.role === 'patient' ? (
                    <FaUserMd className="text-white text-sm" />
                  ) : (
                    <FaUser className="text-white text-sm" />
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {getOtherParticipant(selectedChat)?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <button 
              onClick={() => {
                clearError();
                selectedChat && fetchMessages(selectedChat._id);
              }}
              className="mt-2 px-4 py-2 bg-primaryColor text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => renderMessage(message))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primaryColor"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={!isConnected}
            />
          </div>
          <button
            type="submit"
            disabled={!messageInput.trim() || !isConnected}
            className="bg-primaryColor text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  // Main render
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Please log in to use chat</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {showUserList ? renderUserList() : renderMessages()}
    </div>
  );
};

export default ChatInterface;
