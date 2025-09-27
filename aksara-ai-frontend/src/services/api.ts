import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  }
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
  }
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
        nama_lengkap: result.nama_lengkap,
        email: result.email
      }
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
        nama_lengkap: result.nama_lengkap,
        email: result.email
      }
    };
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userId: string, data: {
    username: string;
    nama_lengkap: string;
    email: string;
  }) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  updatePassword: async (userId: string, data: {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => {
    const response = await api.put(`/users/update-password/${userId}`, data);
    return response.data;
  },
};

export interface ChatRequest {
  input: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  id: string;
  model: string;
  input: string;
  output: string;
  metadata: {
    temperature: number;
    max_tokens: number;
  };
}

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat/message', data);
    return response.data.data;
  },
};

export default api;