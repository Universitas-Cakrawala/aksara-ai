import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired atau invalid
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    },
);

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    nama_lengkap: string;
    email: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        username: string;
        role?: string;
        nama_lengkap: string;
        email: string;
    };
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/users/login', data);
        // Backend returns data wrapped in data field with message
        const result = response.data.data;
        return {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            user: {
                id: result.id,
                username: result.username,
                role: result.role,
                nama_lengkap: result.nama_lengkap,
                email: result.email,
            },
        };
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post('/users/register', data);
        // Backend now returns tokens along with user data after successful registration
        const result = response.data.data;
        return {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            user: {
                id: result.id,
                username: result.username,
                role: result.role,
                nama_lengkap: result.nama_lengkap,
                email: result.email,
            },
        };
    },

    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (
        userId: string,
        data: {
            username: string;
            nama_lengkap: string;
            email: string;
        },
    ) => {
        const response = await api.put(`/users/${userId}`, data);
        return response.data;
    },

    updatePassword: async (
        userId: string,
        data: {
            old_password: string;
            new_password: string;
            confirm_new_password: string;
        },
    ) => {
        const response = await api.put(`/users/update-password/${userId}`, data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/users/logout');
        return response.data;
    },
};

export interface ChatRequest {
    input: string;
    temperature?: number;
    max_tokens?: number;
    chat_history_id?: string;
}

// Response returned by backend ChatController
export interface ChatResponse {
    conversation_id: string;
    model: string;
    input: string;
    output: string;
    timestamp: string;
}

export interface ChatHistory {
    conversation_id: string;
    title: string;
    last_message_preview: string;
    last_sender: string;
    last_timestamp: string;
    total_messages: number;
    model: string;
    language: string;
    is_active: boolean;
    created_date: string;
}

export interface ChatHistoryDetail {
    conversation_id: string;
    title: string;
    model: string;
    language: string;
    is_active: boolean;
    created_date: string;
    messages: Array<{
        message_id: string;
        sender: string;
        text: string;
        timestamp: string;
    }>;
}

export const chatApi = {
    sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
        const response = await api.post('/chat/message', data);
        return response.data.data;
    },

    getChatHistories: async (): Promise<ChatHistory[]> => {
        const response = await api.get('/chat/histories');
        const payload = response.data?.data;

        // Backend returns { histories: [...], total: n }
        let items: any[] = [];
        if (Array.isArray(payload)) {
            items = payload;
        } else if (payload && Array.isArray(payload.histories)) {
            items = payload.histories;
        } else {
            items = [];
        }

        // Normalize each item to ChatHistory interface expected by the UI
        const normalized: ChatHistory[] = items.map((it: any) => ({
            conversation_id: it.id || it.conversation_id || '',
            title: it.title || it.name || 'New Chat',
            last_message_preview: it.last_message || it.last_message_preview || '',
            last_sender: it.last_sender || '',
            last_timestamp: it.updated_date || it.last_timestamp || it.created_date || new Date().toISOString(),
            total_messages: it.message_count ?? it.total_messages ?? 0,
            model: it.model || '',
            language: it.language || '',
            is_active: typeof it.is_active === 'boolean' ? it.is_active : true,
            created_date: it.created_date || new Date().toISOString(),
        }));

        return normalized;
    },

    getChatHistoryById: async (historyId: string): Promise<ChatHistoryDetail> => {
        const response = await api.get(`/chat/histories/${historyId}`);
        return response.data.data;
    },
};

export interface AdminStatistics {
    total_users: number;
    admin_users: number;
    regular_users: number;
}

export interface AdminUser {
    id: string;
    username: string;
    role: string;
    is_active: boolean;
    deleted: boolean;
    created_date: string;
    email?: string | null;
    nama_lengkap?: string | null;
}

export const adminApi = {
    getStatistics: async (): Promise<AdminStatistics> => {
        const response = await api.get('/admin/statistics');
        return response.data.data;
    },

    getUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get('/admin/users');
        return response.data.data;
    },

    toggleUserActive: async (userId: string, isActive: boolean) => {
        const response = await api.patch(`/admin/users/${userId}/toggle-active`, { is_active: isActive });
        return response.data;
    },

    changeUserRole: async (userId: string, role: string) => {
        const response = await api.patch(`/admin/users/${userId}/change-role`, { role });
        return response.data;
    },

    deleteUser: async (userId: string) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    createUser: async (data: {
        username: string;
        password: string;
        nama_lengkap: string;
        email: string;
        role: string;
    }) => {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    updateUser: async (userId: string, data: Partial<{ username: string; role: string; is_active: boolean; nama_lengkap: string; email: string }>) => {
        const response = await api.put(`/admin/users/${userId}`, data);
        return response.data;
    },
};

export default api;
