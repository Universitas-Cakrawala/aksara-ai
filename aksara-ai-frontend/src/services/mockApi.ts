import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from './api';
import { 
  DUMMY_USERS, 
  DUMMY_CHAT_MESSAGES, 
  simulateNetworkDelay,
  type DummyMessage 
} from './dummyData';

// Mock Authentication Service
export const mockAuthApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await simulateNetworkDelay();
    
    // Cari user berdasarkan username dan password
    const user = DUMMY_USERS.find(
      u => u.username === data.username && u.password === data.password
    );
    
    if (!user) {
      throw new Error('Username atau password salah');
    }
    
    // Generate fake token
    const fakeToken = `dummy_token_${user.id}_${Date.now()}`;
    
    return {
      access_token: fakeToken,
      refresh_token: `${fakeToken}_refresh`,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email
      }
    };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await simulateNetworkDelay();
    
    // Cek apakah username sudah ada
    const existingUser = DUMMY_USERS.find(u => u.username === data.username);
    if (existingUser) {
      throw new Error('Username sudah digunakan');
    }
    
    // Cek apakah email sudah ada
    const existingEmail = DUMMY_USERS.find(u => u.email === data.email);
    if (existingEmail) {
      throw new Error('Email sudah digunakan');
    }
    
    // Buat user baru
    const newUser = {
      id: (DUMMY_USERS.length + 1).toString(),
      username: data.username,
      password: data.password,
      nama_lengkap: data.nama_lengkap,
      email: data.email
    };
    
    // Tambahkan ke dummy users (dalam aplikasi nyata ini akan disave ke database)
    DUMMY_USERS.push(newUser);
    
    // Generate fake token
    const fakeToken = `dummy_token_${newUser.id}_${Date.now()}`;
    
    return {
      access_token: fakeToken,
      refresh_token: `${fakeToken}_refresh`,
      user: {
        id: newUser.id,
        username: newUser.username,
        nama_lengkap: newUser.nama_lengkap,
        email: newUser.email
      }
    };
  },

  getProfile: async () => {
    await simulateNetworkDelay();
    
    // Simulasi get user profile dari token
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('User not authenticated');
    }
    
    const parsedUser = JSON.parse(userData);
    return {
      data: {
        user: {
          id: parsedUser.id,
          username: parsedUser.username,
        },
        profile: {
          id_user: parsedUser.id,
          nama_lengkap: parsedUser.nama_lengkap,
          email: parsedUser.email,
        },
      },
    };
  }
};

// Mock Chat Service
export const mockChatApi = {
  getChatHistory: async (): Promise<DummyMessage[]> => {
    await simulateNetworkDelay();
    return [...DUMMY_CHAT_MESSAGES];
  },

  getChatHistories: async () => {
    await simulateNetworkDelay();
    return {
      data: [
        {
          conversation_id: "c0a80154-7c2b-4f6d-9a2b-1a2b3c4d5e6f",
          title: "Diskusi tentang arsitektur Transformer",
          last_message_preview: "Terima kasih, itu sangat jelas.",
          last_sender: "user",
          last_timestamp: "2025-09-27T12:36:45Z",
          total_messages: 4,
          model: "gemini-2.5-flash",
          language: "id",
          is_active: true,
          created_date: "2025-09-27T12:34:56Z",
        },
        {
          conversation_id: "d4f5a6b7-c8d9-40e1-9f2a-0b1c2d3e4f50",
          title: "Catatan harian prompt",
          last_message_preview: "Bisa tolong ringkas poin-poin utamanya?",
          last_sender: "model",
          last_timestamp: "2025-09-26T09:15:10Z",
          total_messages: 2,
          model: "gemini-2.5-flash",
          language: "id",
          is_active: false,
          created_date: "2025-09-26T09:10:00Z",
        },
        {
          conversation_id: "e1f2a3b4-c5d6-47e8-9a0b-1c2d3e4f5g6h",
          title: "Rencana perjalanan liburan",
          last_message_preview: "Apa rekomendasi tempat makan di sana?",
          last_sender: "user",
          last_timestamp: "2025-09-25T18:45:30Z",
          total_messages: 5,
          model: "gemini-2.5-flash",
          language: "id",
          is_active: true,
          created_date: "2025-09-25T18:30:00Z",
        },
      ],
    };
  },

  getChatHistoryById: async (historyId: string) => {
    await simulateNetworkDelay();
    return {
      data: {
        conversation_id: historyId,
        title: "Diskusi tentang arsitektur Transformer",
        model: "gemini-2.5-flash",
        language: "id",
        is_active: true,
        created_date: "2025-09-27T12:34:56Z",
        messages: [
          {
            message_id: "m1",
            sender: "user",
            text: "Halo, bisakah kamu menjelaskan bagaimana arsitektur Transformer bekerja?",
            timestamp: "2025-09-27T12:34:56Z",
          },
          {
            message_id: "m2",
            sender: "model",
            text: "Tentu! Arsitektur Transformer adalah model deep learning yang menggunakan mekanisme attention untuk memproses data sekuensial...",
            timestamp: "2025-09-27T12:35:30Z",
          },
          {
            message_id: "m3",
            sender: "user",
            text: "Bisakah kamu memberikan contoh aplikasinya?",
            timestamp: "2025-09-27T12:36:10Z",
          },
          {
            message_id: "m4",
            sender: "model",
            text: "Tentu! Transformer banyak digunakan dalam pemrosesan bahasa alami, seperti dalam model GPT dan BERT...",
            timestamp: "2025-09-27T12:36:45Z",
          },
        ],
      },
    };
  },

  sendMessage: async (message: string): Promise<DummyMessage> => {
    await simulateNetworkDelay(500, 2000); // Simulasi thinking time untuk AI
    
    // Generate dummy AI response based on user message
    const responses = [
      `Mengenai "${message.slice(0, 20)}...", saya pikir hal ini sangat menarik untuk dibahas.`,
      "Itu pertanyaan yang menarik! Mari saya bantu Anda dengan hal tersebut.",
      "Saya memahami apa yang Anda maksud. Berikut adalah pendapat saya...",
      "Berdasarkan pemahaman saya, hal ini bisa didekati dengan beberapa cara.",
      "Terima kasih atas pertanyaannya. Saya akan mencoba memberikan jawaban yang membantu.",
      "Itu topik yang kompleks. Mari kita bahas step by step.",
      "Saya senang Anda bertanya tentang hal ini. Berikut penjelasan saya...",
      "Pertanyaan yang bagus! Mari saya jelaskan dengan detail.",
      "Hmm, ini memerlukan pemikiran yang mendalam. Menurut saya...",
      "Saya dapat membantu dengan itu. Berikut adalah solusi yang saya rekomendasikan:",
      "Terima kasih telah berbagi. Saya pikir pendekatan terbaik adalah..."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Date.now().toString(),
      text: randomResponse,
      sender: 'ai',
      timestamp: new Date()
    };
  }
};

export default {
  auth: mockAuthApi,
  chat: mockChatApi
};