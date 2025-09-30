# Installation Guide - Aksara AI

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Manual Installation](#manual-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## 📋 Prerequisites

### System Requirements

#### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **CPU**: 2 cores minimum, 4+ cores recommended

#### Software Dependencies
- **Node.js**: Version 18.0+ ([Download](https://nodejs.org/))
- **Python**: Version 3.10+ ([Download](https://python.org/))
- **PostgreSQL**: Version 14+ ([Download](https://postgresql.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))

#### Optional (Recommended)
- **Docker**: For containerized deployment ([Download](https://docker.com/))
- **Docker Compose**: For multi-container orchestration
- **VS Code**: For development ([Download](https://code.visualstudio.com/))

### Verification Commands

Check if prerequisites are installed:

```bash
# Node.js and npm
node --version  # Should be 18.0+
npm --version   # Should be 8.0+

# Python and pip
python --version  # Should be 3.10+
pip --version     # Should be latest

# PostgreSQL
psql --version    # Should be 14+

# Git
git --version     # Should be latest

# Docker (optional)
docker --version         # Should be latest
docker-compose --version # Should be latest
```

## 🚀 Quick Start

Get Aksara AI running in under 5 minutes:

### 1. Clone Repository
```bash
git clone https://github.com/your-username/aksara-ai.git
cd aksara-ai
```

### 2. Quick Setup Script

#### For Windows (PowerShell)
```powershell
# Run the setup script
.\scripts\setup-windows.ps1
```

#### For macOS/Linux
```bash
# Make script executable and run
chmod +x scripts/setup-unix.sh
./scripts/setup-unix.sh
```

### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Development Setup

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd aksara-ai-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # .env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_DUMMY_MODE=false
   VITE_APP_NAME=Aksara AI
   VITE_DEBUG=true
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd aksara-ai-backend
   ```

2. **Create virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables**
   ```env
   # .env
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/aksara_ai
   SECRET_KEY=your-super-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=30
   ENVIRONMENT=development
   LOG_LEVEL=DEBUG
   ```

6. **Setup database**
   ```bash
   # Create database
   createdb aksara_ai

   # Run migrations
   alembic upgrade head

   # Seed database (optional)
   python seed.py
   ```

7. **Start development server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🏭 Production Deployment

### Environment Preparation

1. **Server Requirements**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB+ RAM, 2+ CPU cores
   - 10GB+ storage
   - Domain name and SSL certificate

2. **Install dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Python
   sudo apt install python3.10 python3.10-venv python3.10-dev python3-pip -y

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y

   # Install Nginx
   sudo apt install nginx -y

   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

### Production Configuration

1. **Clone and setup**
   ```bash
   git clone https://github.com/your-username/aksara-ai.git
   cd aksara-ai
   ```

2. **Configure environment**
   ```bash
   # Backend configuration
   cd aksara-ai-backend
   cp .env.example .env.production
   
   # Edit production environment
   nano .env.production
   ```

   ```env
   # .env.production
   DATABASE_URL=postgresql+asyncpg://postgres:STRONG_PASSWORD@localhost:5432/aksara_ai_prod
   SECRET_KEY=SUPER_STRONG_SECRET_KEY_HERE
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=30
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Setup database**
   ```bash
   # Create production database
   sudo -u postgres createdb aksara_ai_prod
   sudo -u postgres createuser --interactive aksara_app
   
   # Grant permissions
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aksara_ai_prod TO aksara_app;"
   sudo -u postgres psql -c "ALTER USER aksara_app PASSWORD 'STRONG_PASSWORD';"
   ```

4. **Build and deploy**
   ```bash
   # Backend deployment
   cd aksara-ai-backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head

   # Frontend build
   cd ../aksara-ai-frontend
   npm install
   npm run build
   ```

### Nginx Configuration

1. **Create Nginx config**
   ```bash
   sudo nano /etc/nginx/sites-available/aksara-ai
   ```

2. **Nginx configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
       
       # SSL Configuration
       ssl_certificate /path/to/your/certificate.crt;
       ssl_certificate_key /path/to/your/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       
       # Frontend
       location / {
           root /path/to/aksara-ai/aksara-ai-frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:8000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # WebSocket support (if needed)
       location /ws/ {
           proxy_pass http://localhost:8000/ws/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

3. **Enable site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/aksara-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Process Management

1. **Create systemd service for backend**
   ```bash
   sudo nano /etc/systemd/system/aksara-ai-backend.service
   ```

   ```ini
   [Unit]
   Description=Aksara AI Backend
   After=network.target postgresql.service

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/aksara-ai/aksara-ai-backend
   Environment=PATH=/path/to/aksara-ai/aksara-ai-backend/venv/bin
   EnvironmentFile=/path/to/aksara-ai/aksara-ai-backend/.env.production
   ExecStart=/path/to/aksara-ai/aksara-ai-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

2. **Start services**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable aksara-ai-backend
   sudo systemctl start aksara-ai-backend
   sudo systemctl status aksara-ai-backend
   ```

## 🐳 Docker Setup

### Development with Docker

1. **Use development Docker Compose**
   ```bash
   # Start development environment
   docker-compose -f docker-compose.dev.yml up -d

   # View logs
   docker-compose -f docker-compose.dev.yml logs -f

   # Stop environment
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Development configuration** (`docker-compose.dev.yml`)
   ```yaml
   version: '3.8'

   services:
     frontend:
       build:
         context: ./aksara-ai-frontend
         dockerfile: Dockerfile.dev
       ports:
         - "5173:5173"
       volumes:
         - ./aksara-ai-frontend:/app
         - /app/node_modules
       environment:
         - VITE_API_BASE_URL=http://localhost:8000

     backend:
       build:
         context: ./aksara-ai-backend
         dockerfile: Dockerfile.dev
       ports:
         - "8000:8000"
       volumes:
         - ./aksara-ai-backend:/app
       environment:
         - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aksara_ai
         - ENVIRONMENT=development
       depends_on:
         - db

     db:
       image: postgres:14
       environment:
         - POSTGRES_DB=aksara_ai
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_dev_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"

   volumes:
     postgres_dev_data:
   ```

### Production with Docker

1. **Production Docker Compose**
   ```bash
   # Build and start production
   docker-compose up -d --build

   # Run migrations
   docker-compose exec backend alembic upgrade head

   # View logs
   docker-compose logs -f

   # Scale services
   docker-compose up -d --scale backend=3
   ```

2. **Production configuration** (`docker-compose.yml`)
   ```yaml
   version: '3.8'

   services:
     frontend:
       build:
         context: ./aksara-ai-frontend
         dockerfile: Dockerfile
       restart: unless-stopped
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"

     backend:
       build:
         context: ./aksara-ai-backend
         dockerfile: Dockerfile
       restart: unless-stopped
       environment:
         - DATABASE_URL=postgresql+asyncpg://postgres:${POSTGRES_PASSWORD}@db:5432/aksara_ai
         - SECRET_KEY=${SECRET_KEY}
         - ENVIRONMENT=production
       depends_on:
         - db
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.backend.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"

     db:
       image: postgres:14
       restart: unless-stopped
       environment:
         - POSTGRES_DB=aksara_ai
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
       volumes:
         - postgres_prod_data:/var/lib/postgresql/data

     traefik:
       image: traefik:v2.9
       restart: unless-stopped
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
         - ./traefik.yml:/traefik.yml

   volumes:
     postgres_prod_data:
   ```

## 🔧 Manual Installation

### Without Docker

#### Frontend Manual Setup

1. **Install Node.js dependencies**
   ```bash
   cd aksara-ai-frontend
   npm install --production
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Serve with static server**
   ```bash
   # Using serve
   npm install -g serve
   serve -s dist -l 3000

   # Using Python
   cd dist
   python -m http.server 3000

   # Using Nginx (copy dist to web root)
   sudo cp -r dist/* /var/www/html/
   ```

#### Backend Manual Setup

1. **Create virtual environment**
   ```bash
   cd aksara-ai-backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. **Install production dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup database**
   ```bash
   # Install and start PostgreSQL
   sudo apt install postgresql postgresql-contrib

   # Create database and user
   sudo -u postgres createdb aksara_ai
   sudo -u postgres createuser aksara_user
   sudo -u postgres psql -c "ALTER USER aksara_user PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aksara_ai TO aksara_user;"
   ```

4. **Run migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start application**
   ```bash
   # Development
   uvicorn main:app --reload

   # Production
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in `aksara-ai-backend/`:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/database_name

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Application Configuration
APP_NAME=Aksara AI Backend
APP_VERSION=1.0.0
ENVIRONMENT=development  # development, staging, production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# Logging Configuration
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL

# AI Service Configuration (if using external AI service)
AI_SERVICE_URL=https://api.openai.com/v1
AI_SERVICE_API_KEY=your-ai-service-api-key

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=another-super-secret-key

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600  # seconds

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

Create `.env` file in `aksara-ai-frontend/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Application Configuration
VITE_APP_NAME=Aksara AI
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=AI-Powered Chat Application

# Feature Flags
VITE_DUMMY_MODE=false
VITE_DEBUG=true
VITE_ANALYTICS_ENABLED=false

# UI Configuration
VITE_THEME=light  # light, dark, auto
VITE_LANGUAGE=en  # en, id

# External Services
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your-sentry-dsn

# Development Configuration
VITE_HOT_RELOAD=true
VITE_SOURCE_MAPS=true
```

## 🗄️ Database Setup

### PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### CentOS/RHEL
```bash
sudo dnf install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Using MacPorts
sudo port install postgresql14-server
sudo port load postgresql14-server
```

#### Windows
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Remember the password for the `postgres` user

### Database Configuration

1. **Access PostgreSQL**
   ```bash
   sudo -u postgres psql
   ```

2. **Create database and user**
   ```sql
   -- Create database
   CREATE DATABASE aksara_ai;

   -- Create user
   CREATE USER aksara_user WITH PASSWORD 'your_strong_password';

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE aksara_ai TO aksara_user;

   -- Grant schema privileges
   \c aksara_ai
   GRANT ALL PRIVILEGES ON SCHEMA public TO aksara_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aksara_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aksara_user;

   -- Exit
   \q
   ```

3. **Test connection**
   ```bash
   psql -h localhost -U aksara_user -d aksara_ai
   ```

### Database Migrations

1. **Initialize migration environment**
   ```bash
   cd aksara-ai-backend
   alembic init migrations
   ```

2. **Configure Alembic** (`alembic.ini`)
   ```ini
   sqlalchemy.url = postgresql+asyncpg://aksara_user:password@localhost:5432/aksara_ai
   ```

3. **Run migrations**
   ```bash
   # Create migration
   alembic revision --autogenerate -m "Initial migration"

   # Apply migrations
   alembic upgrade head

   # Check current version
   alembic current

   # View migration history
   alembic history
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows

# Use different port
npm run dev -- --port 3001
```

#### 2. Database Connection Failed

**Problem**: `Connection to database failed`

**Solutions**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection
psql -h localhost -U postgres -c "SELECT version();"

# Verify environment variables
echo $DATABASE_URL
```

#### 3. Permission Denied

**Problem**: `Permission denied` errors

**Solutions**:
```bash
# Fix file permissions
chmod +x scripts/*.sh

# Fix directory permissions
sudo chown -R $USER:$USER .

# Fix PostgreSQL permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aksara_ai TO aksara_user;"
```

#### 4. Module Not Found

**Problem**: `ModuleNotFoundError` or `Cannot find module`

**Solutions**:
```bash
# Backend - reinstall dependencies
cd aksara-ai-backend
pip install -r requirements.txt

# Frontend - clear cache and reinstall
cd aksara-ai-frontend
rm -rf node_modules package-lock.json
npm install

# Clear Python cache
find . -type d -name "__pycache__" -delete
```

#### 5. CORS Issues

**Problem**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
```python
# Update CORS settings in backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 6. Environment Variables Not Loaded

**Problem**: Environment variables not working

**Solutions**:
```bash
# Check if .env file exists
ls -la .env

# Load environment manually
export $(cat .env | xargs)

# Verify variables
printenv | grep VITE_

# For Windows
Get-Content .env | ForEach-Object { $env:$_.Split('=')[0] = $_.Split('=')[1] }
```

### Debugging Steps

1. **Check logs**
   ```bash
   # Backend logs
   tail -f logs/aksara-ai.log

   # Docker logs
   docker-compose logs -f backend

   # System logs
   journalctl -u aksara-ai-backend -f
   ```

2. **Verify services**
   ```bash
   # Check running processes
   ps aux | grep python
   ps aux | grep node

   # Check open ports
   netstat -tulpn | grep LISTEN
   ```

3. **Test API endpoints**
   ```bash
   # Health check
   curl http://localhost:8000/health

   # API documentation
   curl http://localhost:8000/docs
   ```

### Performance Tuning

1. **Database optimization**
   ```sql
   -- Create indexes
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_chat_histories_user_id ON chat_histories(user_id);

   -- Analyze tables
   ANALYZE users;
   ANALYZE chat_histories;
   ```

2. **Backend optimization**
   ```python
   # Connection pooling
   engine = create_async_engine(
       DATABASE_URL,
       pool_size=20,
       max_overflow=0,
       pool_pre_ping=True,
   )
   ```

3. **Frontend optimization**
   ```javascript
   // Enable compression
   import compression from 'vite-plugin-compression';

   export default {
     plugins: [
       compression({ algorithm: 'gzip' })
     ]
   }
   ```

### Support Resources

- **Documentation**: Check `/docs` folder for detailed guides
- **GitHub Issues**: Report bugs and request features
- **Community**: Join our Discord/Slack community
- **Email**: support@aksara-ai.com

This comprehensive installation guide covers all aspects of setting up Aksara AI from development to production deployment, with detailed troubleshooting for common issues.