import type { AuthResponse, LoginRequest, RegisterRequest } from './api';
import { DUMMY_CHAT_MESSAGES, DUMMY_USERS, simulateNetworkDelay, type DummyMessage } from './dummyData';

// Mock Authentication Service
export const mockAuthApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        await simulateNetworkDelay();

        // Cari user berdasarkan username dan password
        const user = DUMMY_USERS.find((u) => u.username === data.username && u.password === data.password);

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
                email: user.email,
            },
        };
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        await simulateNetworkDelay();

        // Cek apakah username sudah ada
        const existingUser = DUMMY_USERS.find((u) => u.username === data.username);
        if (existingUser) {
            throw new Error('Username sudah digunakan');
        }

        // Cek apakah email sudah ada
        const existingEmail = DUMMY_USERS.find((u) => u.email === data.email);
        if (existingEmail) {
            throw new Error('Email sudah digunakan');
        }

        // Buat user baru
        const newUser = {
            id: (DUMMY_USERS.length + 1).toString(),
            username: data.username,
            password: data.password,
            nama_lengkap: data.nama_lengkap,
            email: data.email,
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
                email: newUser.email,
            },
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
    },
};

// Mock Chat Service
export const mockChatApi = {
    getChatHistory: async (): Promise<DummyMessage[]> => {
        await simulateNetworkDelay();
        return [...DUMMY_CHAT_MESSAGES];
    },

    sendMessage: async (message: string): Promise<DummyMessage> => {
        await simulateNetworkDelay(500, 2000); // Simulasi thinking time untuk AI

        // Generate dummy AI response based on user message
        const responses = [
            `Mengenai "${message.slice(0, 20)}...", saya pikir hal ini sangat menarik untuk dibahas.`,
            'Itu pertanyaan yang menarik! Mari saya bantu Anda dengan hal tersebut.',
            'Saya memahami apa yang Anda maksud. Berikut adalah pendapat saya...',
            'Berdasarkan pemahaman saya, hal ini bisa didekati dengan beberapa cara.',
            'Terima kasih atas pertanyaannya. Saya akan mencoba memberikan jawaban yang membantu.',
            'Itu topik yang kompleks. Mari kita bahas step by step.',
            'Saya senang Anda bertanya tentang hal ini. Berikut penjelasan saya...',
            'Pertanyaan yang bagus! Mari saya jelaskan dengan detail.',
            'Hmm, ini memerlukan pemikiran yang mendalam. Menurut saya...',
            'Saya dapat membantu dengan itu. Berikut adalah solusi yang saya rekomendasikan:',
            'Terima kasih telah berbagi. Saya pikir pendekatan terbaik adalah...',
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return {
            id: Date.now().toString(),
            text: randomResponse,
            sender: 'ai',
            timestamp: new Date(),
        };
    },
};

export default {
    auth: mockAuthApi,
    chat: mockChatApi,
};
