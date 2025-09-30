import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Search, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatApi } from '@/services/api';
import { mockChatApi } from '@/services/mockApi';
import { DUMMY_MODE } from '@/services/dummyData';

interface ChatHistory {
  conversation_id: string;
  title: string;
  last_message_preview: string;
  last_sender: 'user' | 'model';
  last_timestamp: string;
  total_messages: number;
  model: string;
  language: string;
  is_active: boolean;
  created_date: string;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectHistory: (historyId: string) => void;
  onNewChat: () => void;
  selectedHistoryId?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onToggle,
  onSelectHistory,
  onNewChat,
  selectedHistoryId,
}) => {
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatHistories();
  }, []);

  useEffect(() => {
    // Filter histories based on search query
    if (searchQuery.trim() === '') {
      setFilteredHistories(histories);
    } else {
      const filtered = histories.filter(
        (history) =>
          history.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          history.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistories(filtered);
    }
  }, [histories, searchQuery]);

  const loadChatHistories = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (DUMMY_MODE) {
        // Use mock data for dummy mode
        response = await mockChatApi.getChatHistories();
      } else {
        // Use real API
        response = await chatApi.getChatHistories();
      }
      
      setHistories(response.data || response);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      setHistories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
    
    const diffInDays = Math.floor(diffInMinutes / 1440);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen) {
    return (
      <div className="fixed left-0 top-0 h-full z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r shadow-lg z-40 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Chat</h2>
            <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
              ×
            </Button>
          </div>
          
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Chat Baru
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari riwayat chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat Histories */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Memuat riwayat...</p>
            </div>
          ) : filteredHistories.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat chat'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredHistories.map((history) => (
                <div
                  key={history.conversation_id}
                  onClick={() => onSelectHistory(history.conversation_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedHistoryId === history.conversation_id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {history.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {truncateText(history.last_message_preview)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(history.last_timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">
                            {history.total_messages} pesan
                          </span>
                          {history.is_active && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add dropdown menu for actions
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {filteredHistories.length} dari {histories.length} percakapan
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;