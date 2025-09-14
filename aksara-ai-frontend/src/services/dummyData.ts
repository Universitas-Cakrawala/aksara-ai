// Dummy data untuk development
export interface DummyUser {
  id: string;
  username: string;
  password: string;
  nama_lengkap: string;
  email: string;
}

export interface DummyMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Dummy users untuk testing
export const DUMMY_USERS: DummyUser[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    nama_lengkap: 'Administrator',
    email: 'admin@aksara.ai'
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    nama_lengkap: 'User Test',
    email: 'user@aksara.ai'
  },
  {
    id: '3',
    username: 'demo',
    password: 'demo123',
    nama_lengkap: 'Demo User',
    email: 'demo@aksara.ai'
  }
];

// Dummy chat messages
export const DUMMY_CHAT_MESSAGES: DummyMessage[] = [
  {
    id: '1',
    text: 'Halo! Selamat datang di Aksara AI. Bagaimana saya bisa membantu Anda hari ini?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 300000) // 5 menit yang lalu
  },
  {
    id: '2',
    text: 'Halo, saya ingin tahu lebih banyak tentang AI writing assistant.',
    sender: 'user',
    timestamp: new Date(Date.now() - 240000) // 4 menit yang lalu
  },
  {
    id: '3',
    text: 'Tentu! Aksara AI adalah asisten penulisan yang dapat membantu Anda dalam berbagai tugas seperti:\n\n1. Menulis artikel dan blog\n2. Membuat konten marketing\n3. Mengoreksi tata bahasa\n4. Brainstorming ide\n5. Terjemahan teks\n\nAda yang ingin Anda coba?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 180000) // 3 menit yang lalu
  }
];

// Environment variable untuk enable/disable dummy mode
export const DUMMY_MODE = import.meta.env.VITE_DUMMY_MODE === 'true' || import.meta.env.NODE_ENV === 'development';

// Simulated network delay untuk realism
export const simulateNetworkDelay = (min: number = 300, max: number = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};