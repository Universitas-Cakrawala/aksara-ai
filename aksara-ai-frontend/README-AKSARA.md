# Aksara AI Frontend

Frontend aplikasi chat AI untuk Komunitas Literasi Kampus (Aksara). Dibangun dengan React, TypeScript, Tailwind CSS v4, dan ShadCN UI components.

## Features

- ✅ Halaman Authentication (Login/Register)
- ✅ Halaman Chat AI
- ✅ Routing dengan React Router
- ✅ Form validation dengan Zod dan React Hook Form
- ✅ State management dengan Context API
- ✅ Responsive design dengan Tailwind CSS v4
- ✅ Modern UI components dengan ShadCN
- ✅ API integration dengan Axios

## Tech Stack

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **ShadCN UI** - UI components
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd aksara-ai-frontend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```
Edit `.env` file sesuai dengan konfigurasi backend.

4. Start development server
```bash
npm run dev
```

Application akan berjalan di `http://localhost:5173`

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # ShadCN UI components
│   ├── LoginForm.tsx   # Login form component
│   ├── RegisterForm.tsx # Register form component
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   ├── AuthPage.tsx    # Authentication page
│   └── ChatPage.tsx    # Main chat interface
├── context/            # React context
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts          # API client and endpoints
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
└── hooks/              # Custom hooks (ready for future use)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

Frontend ini dirancang untuk terintegrasi dengan backend FastAPI. Endpoints yang digunakan:

- `POST /user/register` - User registration
- `POST /user/login` - User login
- `POST /user/profile` - Get user profile

## Authentication Flow

1. User mengisi form login/register
2. Form data dikirim ke backend API
3. Backend mengembalikan JWT token dan user data
4. Token disimpan di localStorage
5. User diarahkan ke halaman chat
6. Token digunakan untuk semua request API selanjutnya

## UI/UX Features

- Responsive design untuk mobile dan desktop
- Dark/light mode support (ready)
- Loading states dan error handling
- Form validation dengan pesan error yang informatif
- Smooth animations dan transitions
- Modern gradient design

## Development Notes

- Menggunakan Tailwind CSS v4 dengan custom color palette
- ShadCN components untuk konsistensi UI
- TypeScript untuk type safety
- Axios interceptors untuk token management
- Protected routes untuk authentication

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is private and belongs to Aksara AI team.