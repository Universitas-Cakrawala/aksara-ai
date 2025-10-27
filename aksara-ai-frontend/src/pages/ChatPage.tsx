import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { chatApi } from '@/services/api';
import { DUMMY_MODE, type DummyMessage } from '@/services/dummyData';
import { mockChatApi } from '@/services/mockApi';
import { Bot, Send, User } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();

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
                    id: msg.id,
                    content: msg.text,
                    sender: msg.sender === 'assistant' ? 'ai' : msg.sender as 'user' | 'ai',
                    timestamp: new Date(msg.created_date),
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

                // Update selectedChatId if we got a conversation_id
                if (chatResponse.conversation_id) {
                    setSelectedChatId(chatResponse.conversation_id);
                }

                setMessages((prev) => [...prev, aiMessage]);

                // Refresh chat history sidebar after sending message
                // Use setTimeout to ensure backend has processed the message
                setTimeout(() => {
                    if (typeof (window as any).__refreshChatHistory === 'function') {
                        (window as any).__refreshChatHistory();
                    }
                }, 500);
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
    // Logout dengan konfirmasi dialog
    const handleLogout = () => {
        setLogoutDialogOpen(true);
    };

    const confirmLogout = () => {
        logout(); // panggil fungsi logout dari context
        setMessages([]); // bersihkan chat
        setInputMessage(''); // reset input
        setLogoutDialogOpen(false);
    };
    // ===========================

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-mustard-50 to-mustard-200">
            {/* Navbar */}
            <Navbar 
                variant="chat" 
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex h-[calc(100vh-64px)] w-full">{/* 64px is navbar height */}
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden lg:w-80 flex-shrink-0`}>
                    <ChatHistorySidebar
                        selectedChatId={selectedChatId || undefined}
                        onChatSelect={handleChatSelect}
                        onNewChat={handleNewChat}
                        className="h-full"
                    />
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col p-6 max-w-full overflow-hidden">
                {/* Messages */}
                <Card className="mb-4 flex-1 overflow-hidden">
                    <CardContent className="h-full overflow-hidden p-0">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600"></div>
                                    <p className="text-sm text-muted-foreground">Memuat chat...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full space-y-4 overflow-y-auto pr-4 scrollbar-w-2 scrollbar-thumb-neutral-500 hover:scrollbar-thumb-neutral-600">
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
                                                message.sender === 'user' ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-white' : 'bg-gray-100'
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
                                                {message.timestamp instanceof Date && !isNaN(message.timestamp.getTime())
                                                    ? message.timestamp.toLocaleTimeString('id-ID', {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : 'Invalid Date'}
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
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600">
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

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar? Chat yang sedang berlangsung akan tetap tersimpan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmLogout}
                            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
                        >
                            Ya, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ChatPage;
