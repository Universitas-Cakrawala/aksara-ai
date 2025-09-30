# Aksara AI - Comprehensive Documentation

Welcome to the complete documentation for Aksara AI, an intelligent chat application for campus literacy communities.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Frontend Documentation](./frontend.md)
- [Backend Documentation](./backend.md)
- [API Documentation](./api.md)
- [Installation Guide](./installation.md)
- [Deployment Guide](./deployment.md)
- [Contributing](./contributing.md)

## 🎯 Project Overview

Aksara AI is a modern, full-stack web application designed to facilitate intelligent conversations within campus literacy communities. The application features real-time chat capabilities powered by AI, user authentication, conversation history, and a responsive user interface.

### Key Features

- 🤖 **AI-Powered Chat**: Integration with Gemini AI for intelligent responses
- 🔐 **Secure Authentication**: JWT-based authentication with refresh tokens
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 💬 **Chat History**: Persistent conversation storage and retrieval
- 👤 **User Management**: Profile management and settings
- 🎨 **Modern UI**: Clean, intuitive interface with shadcn/ui components

### Tech Stack

#### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Form Management**: React Hook Form + Zod
- **Icons**: Lucide React
- **Build Tool**: Vite

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT with PassLib
- **Migration**: Alembic
- **API Documentation**: OpenAPI/Swagger
- **Environment**: Python-decouple
- **CORS**: FastAPI CORS middleware

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Components    │    │ • API Routes    │    │ • Users         │
│ • Context       │    │ • Models        │    │ • Profiles      │
│ • Services      │    │ • Controllers   │    │ • Tokens        │
│ • Pages         │    │ • Middleware    │    │ • Chat History  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Flow

1. **User Authentication**: Login/Register through secure JWT tokens
2. **Chat Interface**: Real-time messaging with AI responses
3. **History Management**: Persistent storage of conversations
4. **Profile Management**: User settings and preferences
5. **Responsive Design**: Seamless experience across devices

## 🚀 Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd aksara-ai
   ```

2. **Setup Backend**
   ```bash
   cd aksara-ai-backend
   pip install -r requirements.txt
   cp .env.example .env
   # Configure environment variables
   python main.py
   ```

3. **Setup Frontend**
   ```bash
   cd aksara-ai-frontend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
aksara-ai/
├── docs/                      # Documentation
├── aksara-ai-backend/         # FastAPI Backend
│   ├── src/                   # Source code
│   ├── migrations/            # Database migrations
│   ├── requirements.txt       # Python dependencies
│   └── main.py               # Application entry point
├── aksara-ai-frontend/        # React Frontend
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── services/        # API services
│   │   └── lib/             # Utilities
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
└── README.md                # Project readme
```

## 🔗 Related Documentation

- [Frontend Documentation](./frontend.md) - Detailed frontend architecture and components
- [Backend Documentation](./backend.md) - API structure and database models
- [API Documentation](./api.md) - Complete API reference
- [Installation Guide](./installation.md) - Step-by-step setup instructions
- [Deployment Guide](./deployment.md) - Production deployment guide

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Please read [Contributing Guide](./contributing.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.