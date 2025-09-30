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

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // load dummy session pertama kali
  useEffect(() => {
    const loadInitial = async () => {
      try {
        if (DUMMY_MODE) {
          const dummyMessages = await mockChatApi.getChatHistory();
          const formattedMessages = dummyMessages.map((msg: DummyMessage) => ({
            id: msg.id,
            content: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
          }));
          const initialSession: ChatSession = {
            id: Date.now().toString(),
            title: 'Chat Awal',
            messages: formattedMessages,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setSessions([initialSession]);
          setActiveSessionId(initialSession.id);
        } else {
          const initialSession: ChatSession = {
            id: Date.now().toString(),
            title: 'Chat Awal',
            messages: [
              {
                id: '1',
                content: 'Halo! Saya adalah Aksara AI. Ada yang bisa saya bantu?',
                sender: 'ai',
                timestamp: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setSessions([initialSession]);
          setActiveSessionId(initialSession.id);
        }
      } catch (err) {
        console.error('Error load initial chat:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Chat baru',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              title: s.messages.length === 0 ? userMessage.content.slice(0, 25) : s.title,
              updatedAt: new Date(),
            }
          : s
      )
    );

    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      let aiMessage: Message;
      if (DUMMY_MODE) {
        const aiResponse = await mockChatApi.sendMessage(currentMessage);
        aiMessage = {
          id: aiResponse.id,
          content: aiResponse.text,
          sender: 'ai',
          timestamp: aiResponse.timestamp,
        };
      } else {
        const chatResponse = await chatApi.sendMessage({
          input: currentMessage,
          temperature: 0.7,
          max_tokens: 512,
        });
        aiMessage = {
          id: chatResponse.id,
          content: chatResponse.output,
          sender: 'ai',
          timestamp: new Date(),
        };
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, aiMessage], updatedAt: new Date() }
            : s
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
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

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout();
      setSessions([]);
      setInputMessage('');
      setActiveSessionId(null);
    }
  };

  // grouping message by date
  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { date: string; items: Message[] }[] = [];
    messages.forEach((msg) => {
      const date = msg.timestamp.toLocaleDateString();
      const existingGroup = grouped.find((g) => g.date === date);
      if (existingGroup) {
        existingGroup.items.push(msg);
      } else {
        grouped.push({ date, items: [msg] });
      }
    });
    return grouped;
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">History</h2>
          <Button size="sm" onClick={createNewSession}>
            + New
          </Button>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-150px)]">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada riwayat</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`cursor-pointer rounded-lg p-2 hover:bg-accent/20 ${
                  activeSessionId === s.id ? 'bg-accent/30' : ''
                }`}
              >
                <p className="font-medium text-sm truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {s.updatedAt.toLocaleDateString()} {s.updatedAt.toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <div>
              <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">
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

        {/* Chat body */}
        <div id="chat-container" className="mx-auto flex h-[calc(100vh-120px)] max-w-4xl flex-col p-4">
          <Card className="mb-4 flex-1">
            <CardContent className="h-full overflow-hidden p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Memuat chat...</p>
                  </div>
                </div>
              ) : activeSessionId ? (
                <div className="h-full space-y-6 overflow-y-auto pr-2">
                  {groupMessagesByDate(
                    sessions.find((s) => s.id === activeSessionId)?.messages || []
                  ).map((group) => (
                    <div key={group.date}>
                      <p className="text-center text-xs text-muted-foreground mb-2">
                        {group.date}
                      </p>
                      {group.items.map((m) => (
                        <div
                          key={m.id}
                          className={`flex gap-3 mb-2 ${
                            m.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {m.sender === 'ai' && (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              m.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {m.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {m.sender === 'user' && (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                              <User className="h-4 w-4 text-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Pilih atau buat sesi chat baru</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input */}
          {activeSessionId && (
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
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
