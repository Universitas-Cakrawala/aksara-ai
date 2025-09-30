# Frontend Documentation - Aksara AI

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Components](#components)
- [Pages](#pages)
- [Context & State Management](#context--state-management)
- [Services & API Integration](#services--api-integration)
- [Routing](#routing)
- [Styling & UI](#styling--ui)
- [Environment Configuration](#environment-configuration)
- [Build & Development](#build--development)

## 🎯 Overview

The Aksara AI frontend is a modern React application built with TypeScript, featuring a responsive design and seamless AI chat experience. It leverages the latest React 19 features with a component-based architecture.

### Key Features

- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔐 **Authentication**: Secure login/register with JWT tokens
- 💬 **Real-time Chat**: Intelligent conversations with AI
- 📱 **Mobile-First**: Responsive design for all screen sizes
- 🔄 **State Management**: Efficient state handling with React Context
- 🛠️ **Type Safety**: Full TypeScript implementation
- 🧩 **Component Library**: Reusable UI components with shadcn/ui

## 📁 Project Structure

```
aksara-ai-frontend/
├── public/                     # Static assets
│   ├── vite.svg               # Vite logo
│   └── index.html             # HTML template
├── src/                       # Source code
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx    # Button component
│   │   │   ├── card.tsx      # Card component
│   │   │   ├── input.tsx     # Input component
│   │   │   └── label.tsx     # Label component
│   │   ├── ChatHistorySidebar.tsx  # Chat history sidebar
│   │   ├── LoginForm.tsx     # Login form component
│   │   ├── RegisterForm.tsx  # Registration form
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── TailwindTest.tsx  # Styling test component
│   ├── context/              # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── pages/                # Page components
│   │   ├── AuthPage.tsx      # Authentication page
│   │   ├── ChatPage.tsx      # Main chat interface
│   │   ├── LandingPage.tsx   # Landing page
│   │   └── ProfilePage.tsx   # User profile page
│   ├── services/             # API services
│   │   ├── api.ts           # Real API client
│   │   ├── mockApi.ts       # Mock API for development
│   │   └── dummyData.ts     # Test data
│   ├── lib/                  # Utilities
│   │   └── utils.ts         # Helper functions
│   ├── hooks/                # Custom hooks (empty)
│   ├── assets/               # Assets
│   │   └── react.svg        # React logo
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   ├── index.css            # Global styles
│   ├── App.css              # App-specific styles
│   └── vite-env.d.ts        # Vite type definitions
├── .env                      # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.ts          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | Latest | Type safety |
| Vite | 7.1.5 | Build tool |
| React Router DOM | 7.9.1 | Client-side routing |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 3.x | Utility-first CSS |
| shadcn/ui | Latest | UI component library |
| Lucide React | 0.544.0 | Icon library |
| Radix UI | 2.x | Headless UI primitives |

### State & Data Management

| Technology | Version | Purpose |
|------------|---------|---------|
| React Context | Built-in | Global state management |
| React Hook Form | 7.62.0 | Form handling |
| Zod | 4.1.8 | Schema validation |
| Axios | 1.12.1 | HTTP client |

## 🧩 Components

### UI Components (`src/components/ui/`)

#### Button Component (`button.tsx`)
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

**Features:**
- Multiple variants and sizes
- Accessible by default
- Customizable with Tailwind classes
- Support for icon buttons

#### Card Component (`card.tsx`)
```typescript
const Card = React.forwardRef<HTMLDivElement, CardProps>(...)
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(...)
const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(...)
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(...)
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(...)
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(...)
```

**Features:**
- Composable card structure
- Semantic HTML elements
- Responsive design
- Consistent spacing

#### Input Component (`input.tsx`)
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Features:**
- Form-ready input fields
- Focus states and validation styles
- Consistent styling across the app

#### Label Component (`label.tsx`)
```typescript
interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  required?: boolean
  tooltip?: string
  helperText?: string
}
```

**Features:**
- Form labels with tooltip support
- Required field indicators
- Helper text support
- Accessibility compliant

### Feature Components

#### ChatHistorySidebar (`ChatHistorySidebar.tsx`)

**Purpose:** Displays chat history with search and navigation capabilities.

**Key Features:**
- Search functionality
- Conversation filtering
- Responsive design (mobile/desktop)
- New chat creation
- History item selection

**Props Interface:**
```typescript
interface ChatHistorySidebarProps {
  isOpen: boolean
  onToggle: () => void
  onSelectHistory: (historyId: string) => void
  onNewChat: () => void
  selectedHistoryId?: string
}
```

**State Management:**
```typescript
const [histories, setHistories] = useState<ChatHistory[]>([])
const [searchTerm, setSearchTerm] = useState('')
const [isLoading, setIsLoading] = useState(true)
```

#### LoginForm (`LoginForm.tsx`)

**Purpose:** Handles user authentication login process.

**Key Features:**
- Form validation with Zod
- Error handling and display
- Loading states
- Responsive design

**Form Schema:**
```typescript
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
})
```

#### RegisterForm (`RegisterForm.tsx`)

**Purpose:** Handles new user registration.

**Key Features:**
- Multi-field validation
- Password confirmation
- Email validation
- Error handling

**Form Schema:**
```typescript
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  nama_lengkap: z.string().min(1, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
```

#### ProtectedRoute (`ProtectedRoute.tsx`)

**Purpose:** Route protection based on authentication status.

**Implementation:**
```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
```

## 📄 Pages

### AuthPage (`AuthPage.tsx`)

**Purpose:** Unified authentication page supporting both login and register modes.

**Key Features:**
- Mode switching (login/register)
- Form validation
- Error handling
- Responsive design
- Automatic redirection after success

**Props:**
```typescript
interface AuthPageProps {
  mode: 'login' | 'register'
}
```

### ChatPage (`ChatPage.tsx`)

**Purpose:** Main chat interface with AI conversation capabilities.

**Key Features:**
- Real-time messaging
- Chat history sidebar
- Conversation loading
- Message formatting
- Responsive design
- Loading states
- Error handling

**State Management:**
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [inputMessage, setInputMessage] = useState('')
const [isTyping, setIsTyping] = useState(false)
const [isSidebarOpen, setIsSidebarOpen] = useState(false)
const [isLoading, setIsLoading] = useState(true)
```

**Message Interface:**
```typescript
interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}
```

### LandingPage (`LandingPage.tsx`)

**Purpose:** Application homepage with feature showcase.

**Key Features:**
- Hero section
- Feature highlights
- Call-to-action buttons
- Responsive design
- Navigation to auth pages

### ProfilePage (`ProfilePage.tsx`)

**Purpose:** User profile management and settings.

**Key Features:**
- Profile information display
- Edit functionality
- Password change
- Form validation
- Error handling

## 🔄 Context & State Management

### AuthContext (`AuthContext.tsx`)

**Purpose:** Global authentication state management.

**State Interface:**
```typescript
interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (profileData: ProfileData) => Promise<void>
  isLoading: boolean
}
```

**User Interface:**
```typescript
interface User {
  id: string
  username: string
  email: string
  nama_lengkap: string
}
```

**Key Features:**
- JWT token management
- Automatic token refresh
- Persistent login state
- Profile updates
- Logout functionality

**Implementation Highlights:**
```typescript
// Token management
useEffect(() => {
  const token = localStorage.getItem('token')
  if (token) {
    // Validate and set user
    validateToken(token)
  }
}, [])

// Auto-logout on token expiry
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout()
    }
    return Promise.reject(error)
  }
)
```

## 🌐 Services & API Integration

### API Service (`api.ts`)

**Purpose:** HTTP client for backend communication.

**Base Configuration:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**Authentication Endpoints:**
```typescript
// Login
login: async (credentials: LoginCredentials) => {
  const response = await api.post('/users/login', credentials)
  return response.data
}

// Register  
register: async (userData: RegisterData) => {
  const response = await api.post('/users/register', userData)
  return response.data
}

// Get Profile
getProfile: async () => {
  const response = await api.get('/users/profile')
  return response.data
}

// Update Profile
updateProfile: async (profileData: ProfileData) => {
  const response = await api.put('/users/profile', profileData)
  return response.data
}
```

**Chat Endpoints:**
```typescript
// Send Message
sendMessage: async (message: ChatMessage) => {
  const response = await api.post('/chat/message', message)
  return response.data
}

// Get Chat Histories
getChatHistories: async () => {
  const response = await api.get('/chat/histories')
  return response.data
}

// Get Specific Chat History
getChatHistoryById: async (historyId: string) => {
  const response = await api.get(`/chat/histories/${historyId}`)
  return response.data
}
```

**Request/Response Interceptors:**
```typescript
// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Mock API Service (`mockApi.ts`)

**Purpose:** Development API for testing without backend.

**Features:**
- Simulated network delays
- Dummy data responses
- Error simulation
- Local storage persistence

**Configuration:**
```typescript
const DUMMY_MODE = import.meta.env.VITE_DUMMY_MODE === 'true'

const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
```

## 🛣️ Routing

### Route Configuration (`App.tsx`)

**Route Structure:**
```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<AuthPage mode="login" />} />
  <Route path="/register" element={<AuthPage mode="register" />} />
  
  {/* Protected Routes */}
  <Route path="/chat" element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  } />
  <Route path="/chat/:conversationId" element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } />
  
  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Navigation Patterns:**
- Authenticated users redirected from auth pages to chat
- Unauthenticated users redirected to login
- Deep linking support for chat conversations
- Fallback to landing page for 404s

## 🎨 Styling & UI

### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more color definitions
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        // ... more animations
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Design System

**Color Palette:**
- Primary: Blue gradients for branding
- Secondary: Purple accents
- Neutral: Gray scale for text and backgrounds
- Semantic: Green (success), Red (error), Yellow (warning)

**Typography:**
- Font Family: System fonts for performance
- Scale: Responsive typography with Tailwind utilities
- Weight: Various weights for hierarchy

**Spacing:**
- Consistent spacing scale (4px base)
- Component-specific spacing
- Responsive spacing utilities

**Responsive Breakpoints:**
```css
sm: 640px
md: 768px  
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Component Styling Patterns

**Card Pattern:**
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply p-6 pb-4;
}

.card-content {
  @apply p-6 pt-0;
}
```

**Button Variants:**
```css
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-outline {
  @apply border border-gray-300 bg-transparent hover:bg-gray-50;
}

.btn-ghost {
  @apply bg-transparent hover:bg-gray-100;
}
```

## ⚙️ Environment Configuration

### Environment Variables (`.env`)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_DUMMY_MODE=false

# App Configuration  
VITE_APP_NAME=Aksara AI
VITE_APP_VERSION=1.0.0

# Debug Settings
VITE_DEBUG=false
```

### Development vs Production

**Development:**
- Hot module replacement
- Source maps enabled
- Mock API available
- Debug logging

**Production:**
- Code splitting
- Asset optimization
- Error boundaries
- Performance monitoring

## 🔧 Build & Development

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite",                    // Start dev server
    "build": "tsc -b && vite build", // Build for production
    "lint": "eslint .",               // Run linting
    "preview": "vite preview"         // Preview production build
  }
}
```

### Build Process

1. **TypeScript Compilation**: `tsc -b`
   - Type checking
   - Generate declaration files
   - Emit compiled JavaScript

2. **Vite Build**: `vite build`
   - Bundle optimization
   - Code splitting
   - Asset processing
   - Production optimizations

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Hot Module Replacement**
   - Instant updates on file changes
   - State preservation during updates
   - Fast feedback loop

3. **Type Checking**
   - Real-time TypeScript errors
   - IDE integration
   - Build-time validation

4. **Linting**
   - ESLint configuration
   - Code quality enforcement
   - Consistent styling

### Performance Considerations

**Code Splitting:**
- Route-based splitting
- Component lazy loading
- Vendor chunk separation

**Asset Optimization:**
- Image compression
- Font optimization
- CSS purging

**Bundle Analysis:**
- Size monitoring
- Dependency analysis
- Performance budgets

## 🧪 Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Testing
- API integration tests
- User flow testing
- Form submission testing

### E2E Testing
- Critical path testing
- Cross-browser compatibility
- Mobile responsiveness

## 📱 Mobile Responsiveness

### Design Principles
- Mobile-first approach
- Touch-friendly interfaces
- Readable typography
- Optimized images

### Implementation
- Responsive grid layouts
- Flexible typography
- Adaptive navigation
- Touch gestures

### Testing
- Device testing
- Browser testing
- Performance testing
- Accessibility testing

This comprehensive frontend documentation covers all aspects of the Aksara AI frontend architecture, from components and routing to styling and build processes. The modular structure and TypeScript implementation ensure maintainability and scalability for future development.