import { Button } from '@/components/ui/button';
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
import { chatApi, type ChatHistory } from '@/services/api';
import { MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ChatHistorySidebarProps {
    selectedChatId?: string;
    onChatSelect: (chatId: string) => void;
    onNewChat: () => void;
    className?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    selectedChatId,
    onChatSelect,
    onNewChat,
    className = '',
}) => {
    const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);

    // Load chat histories
    const loadChatHistories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const histories = await chatApi.getChatHistories();
            setChatHistories(histories);
        } catch (err) {
            console.error('Failed to load chat histories:', err);
            setError('Failed to load chat histories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChatHistories();
    }, [loadChatHistories]);

    // Expose refresh function globally so ChatPage can trigger it
    useEffect(() => {
        (window as any).__refreshChatHistory = loadChatHistories;
        
        return () => {
            delete (window as any).__refreshChatHistory;
        };
    }, [loadChatHistories]);

    // Filter chat histories based on search query
    const filteredHistories = chatHistories.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle chat deletion (soft delete)
    const handleDeleteChat = useCallback((chatId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent chat selection
        setChatToDelete(chatId);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!chatToDelete) return;
        
        try {
            await chatApi.deleteChatHistory(chatToDelete);
            // Remove from local state on success
            setChatHistories(prev => prev.filter(chat => chat.conversation_id !== chatToDelete));
            
            // If deleted chat was selected, trigger new chat
            if (selectedChatId === chatToDelete) {
                onNewChat();
            }
            
            setDeleteDialogOpen(false);
            setChatToDelete(null);
        } catch (err) {
            console.error('Failed to delete chat:', err);
            setError('Failed to delete chat. Please try again.');
            setDeleteDialogOpen(false);
        }
    }, [chatToDelete, selectedChatId, onNewChat]);

    // Format timestamp for display
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className={`bg-white border-r border-gray-200 ${className}`}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
            {/* Header with New Chat button */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
                    <Button
                        onClick={onNewChat}
                        size="sm"
                        className="bg-gradient-to-br from-amber-500 to-yellow-600 hover:bg-gradient-to-br hover:from-amber-600 hover:to-yellow-600 text-white"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {error ? (
                    <div className="p-4">
                        <div className="text-red-600 text-sm">{error}</div>
                        <Button
                            onClick={loadChatHistories}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                ) : filteredHistories.length === 0 ? (
                    <div className="p-4">
                        {searchQuery ? (
                            <div className="text-gray-500 text-sm text-center">
                                No chats found for "{searchQuery}"
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm text-center">
                                No chat history yet. Start a new conversation!
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredHistories.map((chat) => (
                            <div
                                key={chat.conversation_id}
                                onClick={() => onChatSelect(chat.conversation_id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group ${
                                    selectedChatId === chat.conversation_id
                                        ? 'bg-orange-50 border-r-2 border-orange-500'
                                        : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {chat.title}
                                            </h3>
                                        </div>
                                        
                                        <p className="text-xs text-gray-500 truncate mb-2">
                                            {chat.last_message_preview}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                {formatTimestamp(chat.last_timestamp)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {chat.total_messages} messages
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        onClick={(e) => handleDeleteChat(chat.conversation_id, e)}
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Active indicator */}
                                {chat.is_active && (
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                        <span className="text-xs text-green-600">Active</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat History?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ChatHistorySidebar;