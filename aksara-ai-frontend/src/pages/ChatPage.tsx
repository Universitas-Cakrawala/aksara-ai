import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { chatApi } from '@/services/api';
import { DUMMY_MODE, type DummyMessage } from '@/services/dummyData';
import { mockChatApi } from '@/services/mockApi';
import { Bot, LogOut, Send, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
                                'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
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
                            'Halo! Saya adalah Aksara AI, asisten virtual untuk komunitas literasi kampus. Ada yang bisa saya bantu?',
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
                const chatResponse = await chatApi.sendMessage({
                    input: currentMessage,
                    temperature: 0.7,
                    max_tokens: 512,
                });

                const aiMessage: Message = {
                    id: chatResponse.id,
                    content: chatResponse.output,
                    sender: 'ai',
                    timestamp: new Date(),
                };
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <div>
                        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                            Aksara AI
                        </h1>
                        <p className="text-sm text-muted-foreground">Chat AI untuk Komunitas Literasi</p>
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

            {/* Chat Container */}
            <div id="chat-container" className="mx-auto flex h-[calc(100vh-120px)] max-w-4xl flex-col p-4">
                {/* Messages */}
                <Card className="mb-4 flex-1">
                    <CardContent className="h-full overflow-hidden p-4">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                            <p
                                                className={`mt-1 text-xs ${
                                                    message.sender === 'user'
                                                        ? 'text-blue-100'
                                                        : 'text-muted-foreground'
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
    );
};

export default ChatPage;
