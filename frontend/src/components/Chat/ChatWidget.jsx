import React, { useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import ChatInterface from './ChatInterface';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-primaryColor hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <ChatInterface />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
