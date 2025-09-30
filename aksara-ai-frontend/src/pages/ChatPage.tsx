import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { chatApi } from '@/services/api';
import { mockChatApi } from '@/services/mockApi';
import { DUMMY_MODE, type DummyMessage } from '@/services/dummyData';
import { useNavigate, useParams } from 'react-router-dom';
import ChatHistorySidebar from '../components/ChatHistorySidebar';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();

  // Load initial messages
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        if (DUMMY_MODE) {
          const dummyMessages = await mockChatApi.getChatHistory();
          const formattedMessages = dummyMessages.map((msg: DummyMessage) => ({
            id: msg.id,
            content: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([{
            id: '1',
            content: 'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
            sender: 'ai',
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([{
          id: '1',
          content: 'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }
    };

    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      if (DUMMY_MODE) {
        const aiResponse = await mockChatApi.sendMessage(currentMessage);
        const aiMessage: Message = {
          id: aiResponse.id,
          content: aiResponse.text,
          sender: 'ai',
          timestamp: aiResponse.timestamp,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Use real Gemini AI API
        const chatResponse = await chatApi.sendMessage({
          input: currentMessage,
          temperature: 0.7,
          max_tokens: 512
        });
        
        const aiMessage: Message = {
          id: chatResponse.id,
          content: chatResponse.output,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 lg:w-80
      `}>
        <ChatHistorySidebar 
          isOpen={true}
          onToggle={toggleSidebar}
          onSelectHistory={handleConversationSelect}
          onNewChat={() => navigate('/chat')}
          selectedHistoryId={conversationId}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <Bot className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-800">
                Aksara AI Chat
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span>{user?.nama_lengkap || user?.username}</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !conversationId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Bot size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Selamat datang di Aksara AI</h3>
                <p>Mulai percakapan dengan mengetik pesan Anda di bawah</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <Bot size={16} className="mt-1 flex-shrink-0 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.sender === 'user' && (
                        <User size={16} className="mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Bot size={16} className="text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda di sini..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
