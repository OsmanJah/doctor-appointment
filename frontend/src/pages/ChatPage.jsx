import React from 'react';
import ChatInterface from '../components/Chat/ChatInterface';

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <div className="text-sm text-gray-500">
              Real-time messaging between doctors and patients
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
