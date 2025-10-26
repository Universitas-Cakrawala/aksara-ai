import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import { useAuth } from '@/context/AuthContext';
import { chatApi } from '@/services/api';
import { DUMMY_MODE, type DummyMessage } from '@/services/dummyData';
import { mockChatApi } from '@/services/mockApi';
import { Bot, LogOut, Menu, Send, User } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                        timestamp: msg.timestamp,
                    }));
                    setMessages(formattedMessages);
                } else {
                    setMessages([
                        {
                            id: '1',
                            content:
                                'Halo! Saya adalah Aksara AI, asisten virtual untuk UKM literasi Universitas Cakrawala. Ada yang bisa saya bantu?',
                            sender: 'ai',
                            timestamp: new Date(),
                        },
                    ]);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                setMessages([
                    {
                        id: '1',
                        content:
                                'Halo! Saya adalah Aksara AI, asisten virtual untuk UKM literasi Universitas Cakrawala. Ada yang bisa saya bantu?',
                        sender: 'ai',
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatHistory();
    }, []);

    // Load specific chat history when selected
    const loadChatById = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true);
            if (DUMMY_MODE) {
                // Keep existing dummy logic
                const dummyMessages = await mockChatApi.getChatHistory();
                const formattedMessages = dummyMessages.map((msg: DummyMessage) => ({
                    id: msg.id,
                    content: msg.text,
                    sender: msg.sender,
                    timestamp: msg.timestamp,
                }));
                setMessages(formattedMessages);
            } else {
                const chatDetail = await chatApi.getChatHistoryById(chatId);
                const formattedMessages = chatDetail.messages.map((msg) => ({
                    id: msg.message_id,
                    content: msg.text,
                    sender: msg.sender === 'model' ? 'ai' : msg.sender as 'user' | 'ai',
                    timestamp: new Date(msg.timestamp),
                }));
                setMessages(formattedMessages);
            }
            setSelectedChatId(chatId);
        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle chat selection from sidebar
    const handleChatSelect = useCallback((chatId: string) => {
        loadChatById(chatId);
    }, [loadChatById]);

    // Handle new chat creation
    const handleNewChat = useCallback(() => {
        setSelectedChatId(null);
        setMessages([
            {
                id: '1',
                content: 'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
                sender: 'ai',
                timestamp: new Date(),
            },
        ]);
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

        setMessages((prev) => [...prev, userMessage]);
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
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                // Use real Gemini AI API
                const payload = {
                    input: currentMessage,
                    temperature: 0.7,
                    max_tokens: 512,
                    // include selected chat id if present to continue conversation
                    ...(selectedChatId ? { chat_history_id: selectedChatId } : {}),
                };

                const chatResponse = await chatApi.sendMessage(payload);

                const aiMessage: Message = {
                    id: chatResponse.conversation_id + '_' + Date.now().toString(),
                    content: chatResponse.output,
                    sender: 'ai',
                    timestamp: new Date(chatResponse.timestamp || Date.now()),
                };

                // If backend returned a conversation_id, set it as selectedChatId
                if (chatResponse.conversation_id) {
                    setSelectedChatId(chatResponse.conversation_id);
                }

                setMessages((prev) => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
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

    // ===========================
    // Logout dengan konfirmasi + fade out + alert
    const handleLogout = () => {
        const confirmLogout = window.confirm('Apakah Anda yakin ingin logout?');
        if (confirmLogout) {
            // Fade out chat container
            document.getElementById('chat-container')?.classList.add('opacity-0', 'transition-opacity', 'duration-500');

            setTimeout(() => {
                logout(); // panggil fungsi logout dari context
                setMessages([]); // bersihkan chat
                setInputMessage(''); // reset input
                alert('Berhasil logout!');
            }, 500); // delay 500ms untuk efek fade out
        }
    };
    // ===========================

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-gray-50 to-gray-200">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle for Mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-2xl font-bold text-transparent">
                                Aksara AI
                            </h1>
                            <p className="text-sm text-muted-foreground">Chat AI untuk Komunitas Literasi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span className="text-sm">{user?.nama_lengkap}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden lg:w-80`}>
                    <ChatHistorySidebar
                        selectedChatId={selectedChatId || undefined}
                        onChatSelect={handleChatSelect}
                        onNewChat={handleNewChat}
                        className="h-full"
                    />
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col p-4">
                {/* Messages */}
                <Card className="mb-4 flex-1">
                    <CardContent className="h-full overflow-hidden p-4">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600"></div>
                                    <p className="text-sm text-muted-foreground">Memuat chat...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full space-y-4 overflow-y-auto pr-2">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${
                                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {message.sender === 'ai' && (
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                message.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-gray-100'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                            <p
                                                className={`mt-1 text-xs ${
                                                    message.sender === 'user'
                                                        ? 'text-orange-100'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {message.sender === 'user' && (
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                                                <User className="h-4 w-4 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start gap-3">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="rounded-lg bg-muted p-3">
                                            <div className="flex space-x-1">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                                <div
                                                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                    style={{ animationDelay: '0.1s' }}
                                                ></div>
                                                <div
                                                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                                    style={{ animationDelay: '0.2s' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                    {/* Input */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Tulis pesan Anda di sini..."
                                    className="flex-1"
                                    disabled={isTyping}
                                />
                                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
