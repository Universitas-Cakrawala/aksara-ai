import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
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
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  // Load specific conversation when conversationId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        setIsLoading(true);
        try {
          let response;
          if (DUMMY_MODE) {
            response = await mockChatApi.getChatHistoryById(conversationId);
          } else {
            // Use the API method that's available
            response = await chatApi.getChatHistoryById(conversationId);
          }
          
          // Handle different response structures
          const conversation = response.data || response;
          console.log('API Response:', response);
          console.log('Conversation object:', conversation);
          
          // Check if messages exist and is an array
          if (!conversation.messages || !Array.isArray(conversation.messages)) {
            console.error('Invalid conversation structure:', conversation);
            setMessages([{
              id: 'error',
              content: 'Riwayat chat tidak ditemukan atau tidak valid. Silakan mulai chat baru.',
              sender: 'ai',
              timestamp: new Date(),
            }]);
            return;
          }
          
          const formattedMessages = conversation.messages.map((msg: any) => ({
            id: msg.id || msg.message_id,
            content: msg.content || msg.text,
            sender: msg.sender === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error loading conversation:', error);
          console.error('Conversation ID:', conversationId);
          
          // Show a user-friendly error message
          setMessages([{
            id: 'error',
            content: 'Maaf, terjadi kesalahan saat memuat riwayat chat. Silakan coba lagi atau mulai chat baru.',
            sender: 'ai',
            timestamp: new Date(),
          }]);
          
          // Don't redirect immediately, let user decide
          // navigate('/chat');
        } finally {
          setIsLoading(false);
        }
      } else {
        // New chat - clear messages and show welcome
        setMessages([{
          id: '1',
          content: 'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
          sender: 'ai',
          timestamp: new Date(),
        }]);
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, navigate]);

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
        
        // If this is a new conversation, create a conversation ID and update URL
        if (!conversationId && messages.length === 0) {
          const newConversationId = Date.now().toString();
          navigate(`/chat/${newConversationId}`, { replace: true });
        }
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

  const handleConversationSelect = (selectedConversationId: string) => {
    navigate(`/chat/${selectedConversationId}`);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewChat = () => {
    navigate('/chat');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin logout?');
    if (confirmLogout) {
      logout();
      navigate('/auth');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          onNewChat={handleNewChat}
          selectedHistoryId={conversationId}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-none">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">{user?.nama_lengkap}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500">Memuat chat...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
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
                      className={`max-w-2xl px-4 py-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.sender === 'ai' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-2xl px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
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
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda di sini..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[44px]"
                rows={1}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
