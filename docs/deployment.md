# Deployment Guide - Aksara AI

## 📋 Table of Contents

- [Overview](#overview)
- [Deployment Options](#deployment-options)
- [Cloud Deployment](#cloud-deployment)
- [VPS Deployment](#vps-deployment)
- [Container Deployment](#container-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Management](#environment-management)
- [Monitoring & Logging](#monitoring--logging)
- [Security & SSL](#security--ssl)
- [Performance Optimization](#performance-optimization)
- [Backup & Recovery](#backup--recovery)
- [Scaling Strategies](#scaling-strategies)

## 🎯 Overview

This guide covers deploying Aksara AI to production environments, from simple VPS deployments to sophisticated cloud architectures with auto-scaling and monitoring.

### Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Load Balancer/CDN]
    end
    
    subgraph "Frontend"
        FE1[Frontend Instance 1]
        FE2[Frontend Instance 2]
    end
    
    subgraph "Backend"
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        BE3[Backend Instance 3]
    end
    
    subgraph "Database"
        DB[(PostgreSQL)]
        DBR[(Read Replica)]
    end
    
    subgraph "Services"
        REDIS[(Redis Cache)]
        FILES[File Storage]
        LOGS[Log Aggregation]
    end
    
    LB --> FE1
    LB --> FE2
    FE1 --> BE1
    FE1 --> BE2
    FE2 --> BE2
    FE2 --> BE3
    BE1 --> DB
    BE2 --> DB
    BE3 --> DBR
    BE1 --> REDIS
    BE2 --> REDIS
    BE3 --> REDIS
    BE1 --> LOGS
    BE2 --> LOGS
    BE3 --> LOGS
```

## 🚀 Deployment Options

### 1. Simple VPS Deployment
- **Best for**: Small to medium applications
- **Cost**: $10-50/month
- **Complexity**: Low
- **Scalability**: Limited

### 2. Cloud Platform Deployment
- **Best for**: Production applications
- **Cost**: $50-500/month
- **Complexity**: Medium
- **Scalability**: High

### 3. Kubernetes Deployment
- **Best for**: Enterprise applications
- **Cost**: $200-2000/month
- **Complexity**: High
- **Scalability**: Very High

### 4. Serverless Deployment
- **Best for**: Variable traffic applications
- **Cost**: Pay per use
- **Complexity**: Medium
- **Scalability**: Automatic

## ☁️ Cloud Deployment

### AWS Deployment

#### Architecture Overview
```
Internet → CloudFront (CDN) → ALB → EC2 Instances → RDS PostgreSQL
                            → S3 (Static Files)
                            → ElastiCache (Redis)
                            → CloudWatch (Monitoring)
```

#### Step 1: Infrastructure Setup

**VPC and Security Groups**
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=aksara-ai-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id vpc-12345 --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-12345 --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create security groups
aws ec2 create-security-group --group-name aksara-ai-web --description "Web servers" --vpc-id vpc-12345
aws ec2 authorize-security-group-ingress --group-id sg-12345 --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-12345 --protocol tcp --port 443 --cidr 0.0.0.0/0
```

**RDS Database Setup**
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name aksara-ai-db-subnet \
  --db-subnet-group-description "Aksara AI DB Subnet Group" \
  --subnet-ids subnet-12345 subnet-67890

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier aksara-ai-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.9 \
  --master-username aksara_admin \
  --master-user-password YourStrongPassword123 \
  --allocated-storage 100 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-db-12345 \
  --db-subnet-group-name aksara-ai-db-subnet \
  --backup-retention-period 7 \
  --storage-encrypted
```

#### Step 2: EC2 Instance Setup

**Launch Template**
```json
{
  "LaunchTemplateName": "aksara-ai-template",
  "LaunchTemplateData": {
    "ImageId": "ami-0c02fb55956c7d316",
    "InstanceType": "t3.medium",
    "SecurityGroupIds": ["sg-12345"],
    "IamInstanceProfile": {
      "Name": "aksara-ai-instance-profile"
    },
    "UserData": "IyEvYmluL2Jhc2gKY3VybCAtZnNTTCBodHRwczovL2dldC5kb2NrZXIuY29tIC1vIGdldC1kb2NrZXIuc2gKc2ggZ2V0LWRvY2tlci5zaAp1c2VybW9kIC1hRyBkb2NrZXIgZWMyLXVzZXIKc3lzdGVtY3RsIGVuYWJsZSBkb2NrZXIKc3lzdGVtY3RsIHN0YXJ0IGRvY2tlcg=="
  }
}
```

**Auto Scaling Group**
```bash
# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name aksara-ai-asg \
  --launch-template LaunchTemplateName=aksara-ai-template,Version=1 \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/aksara-ai-tg/1234567890123456 \
  --vpc-zone-identifier "subnet-12345,subnet-67890"
```

#### Step 3: Load Balancer Setup

**Application Load Balancer**
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name aksara-ai-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# Create target group
aws elbv2 create-target-group \
  --name aksara-ai-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-12345 \
  --health-check-path /health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/aksara-ai-alb/1234567890123456 \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/aksara-ai-tg/1234567890123456
```

#### Step 4: CloudFront CDN

**CloudFront Distribution**
```json
{
  "CallerReference": "aksara-ai-distribution",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "frontend-origin",
        "DomainName": "aksara-ai-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      },
      {
        "Id": "api-origin",
        "DomainName": "api.aksara-ai.com",
        "CustomOriginConfig": {
          "HTTPPort": 443,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "frontend-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "api-origin",
        "ViewerProtocolPolicy": "https-only",
        "MinTTL": 0,
        "ForwardedValues": {
          "QueryString": true,
          "Cookies": {"Forward": "all"}
        }
      }
    ]
  },
  "Comment": "Aksara AI CDN Distribution",
  "Enabled": true
}
```

### Google Cloud Platform (GCP) Deployment

#### Step 1: Project Setup
```bash
# Set project
gcloud config set project aksara-ai-prod

# Enable APIs
gcloud services enable compute.googleapis.com
gcloud services enable sql.googleapis.com
gcloud services enable container.googleapis.com
```

#### Step 2: Database Setup
```bash
# Create Cloud SQL instance
gcloud sql instances create aksara-ai-db \
  --database-version=POSTGRES_14 \
  --tier=db-n1-standard-2 \
  --region=us-central1 \
  --storage-size=100GB \
  --storage-type=SSD \
  --backup-start-time=03:00

# Create database
gcloud sql databases create aksara_ai --instance=aksara-ai-db

# Create user
gcloud sql users create aksara_user --instance=aksara-ai-db --password=StrongPassword123
```

#### Step 3: Container Registry
```bash
# Build and push images
docker build -t gcr.io/aksara-ai-prod/backend ./aksara-ai-backend
docker build -t gcr.io/aksara-ai-prod/frontend ./aksara-ai-frontend

docker push gcr.io/aksara-ai-prod/backend
docker push gcr.io/aksara-ai-prod/frontend
```

#### Step 4: GKE Cluster
```bash
# Create cluster
gcloud container clusters create aksara-ai-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10

# Get credentials
gcloud container clusters get-credentials aksara-ai-cluster --zone=us-central1-a
```

### Azure Deployment

#### Step 1: Resource Group
```bash
# Create resource group
az group create --name aksara-ai-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name aksara-ai-plan \
  --resource-group aksara-ai-rg \
  --sku P1V2 \
  --is-linux
```

#### Step 2: Database Setup
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group aksara-ai-rg \
  --name aksara-ai-db-server \
  --location eastus \
  --admin-user aksara_admin \
  --admin-password StrongPassword123 \
  --sku-name GP_Gen5_2 \
  --version 14

# Create database
az postgres db create \
  --resource-group aksara-ai-rg \
  --server-name aksara-ai-db-server \
  --name aksara_ai
```

#### Step 3: Web Apps
```bash
# Create backend web app
az webapp create \
  --resource-group aksara-ai-rg \
  --plan aksara-ai-plan \
  --name aksara-ai-backend \
  --deployment-container-image-name aksaraai/backend:latest

# Create frontend web app
az webapp create \
  --resource-group aksara-ai-rg \
  --plan aksara-ai-plan \
  --name aksara-ai-frontend \
  --deployment-container-image-name aksaraai/frontend:latest
```

## 🖥️ VPS Deployment

### DigitalOcean Droplet

#### Step 1: Droplet Creation
```bash
# Create droplet using doctl
doctl compute droplet create aksara-ai-prod \
  --image ubuntu-20-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc3 \
  --ssh-keys your-ssh-key-id
```

#### Step 2: Initial Server Setup
```bash
# Connect to droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y nginx postgresql postgresql-contrib nodejs npm python3 python3-pip python3-venv git

# Create non-root user
adduser aksara
usermod -aG sudo aksara
```

#### Step 3: Application Deployment
```bash
# Switch to application user
su - aksara

# Clone repository
git clone https://github.com/your-username/aksara-ai.git
cd aksara-ai

# Setup backend
cd aksara-ai-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../aksara-ai-frontend
npm install
npm run build

# Setup database
sudo -u postgres createdb aksara_ai
sudo -u postgres createuser aksara_user
sudo -u postgres psql -c "ALTER USER aksara_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aksara_ai TO aksara_user;"
```

#### Step 4: Process Management with PM2
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'aksara-ai-backend',
      cwd: '/home/aksara/aksara-ai/aksara-ai-backend',
      script: 'venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000',
      env: {
        DATABASE_URL: 'postgresql+asyncpg://aksara_user:password@localhost:5432/aksara_ai',
        SECRET_KEY: 'your-production-secret-key',
        ENVIRONMENT: 'production'
      },
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      max_restarts: 3,
      min_uptime: '10s'
    }
  ]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Linode Deployment

#### Step 1: Instance Creation
```bash
# Create Linode instance
linode-cli linodes create \
  --type g6-standard-2 \
  --region us-east \
  --image linode/ubuntu20.04 \
  --root_pass your-root-password \
  --label aksara-ai-prod
```

#### Step 2: Domain and DNS Setup
```bash
# Add domain
linode-cli domains create --domain aksara-ai.com --type master

# Add DNS records
linode-cli domains records create aksara-ai.com \
  --type A \
  --name www \
  --target your-server-ip

linode-cli domains records create aksara-ai.com \
  --type A \
  --name api \
  --target your-server-ip
```

## 🐳 Container Deployment

### Docker Swarm

#### Step 1: Swarm Initialization
```bash
# Initialize swarm on manager node
docker swarm init --advertise-addr your-manager-ip

# Join worker nodes
docker swarm join --token SWMTKN-1-token your-manager-ip:2377
```

#### Step 2: Stack Deployment
```yaml
# docker-stack.yml
version: '3.8'

services:
  frontend:
    image: aksaraai/frontend:latest
    ports:
      - "80:80"
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  backend:
    image: aksaraai/backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/aksara_ai
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=aksara_ai
      - POSTGRES_USER=aksara_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - db_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  db_data:
```

```bash
# Deploy stack
docker stack deploy -c docker-stack.yml aksara-ai
```

### Kubernetes Deployment

#### Step 1: Namespace and ConfigMap
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aksara-ai

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aksara-ai-config
  namespace: aksara-ai
data:
  DATABASE_URL: "postgresql+asyncpg://user:pass@postgres:5432/aksara_ai"
  ENVIRONMENT: "production"
```

#### Step 2: Database Deployment
```yaml
# postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: aksara-ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        env:
        - name: POSTGRES_DB
          value: aksara_ai
        - name: POSTGRES_USER
          value: aksara_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: aksara-ai
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### Step 3: Backend Deployment
```yaml
# backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: aksara-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: aksaraai/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: aksara-ai-config
        - secretRef:
            name: aksara-ai-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: aksara-ai
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### Step 4: Ingress Configuration
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aksara-ai-ingress
  namespace: aksara-ai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  tls:
  - hosts:
    - aksara-ai.com
    - api.aksara-ai.com
    secretName: aksara-ai-tls
  rules:
  - host: aksara-ai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.aksara-ai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### Step 1: Workflow Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Test Backend
      run: |
        cd aksara-ai-backend
        pip install -r requirements.txt
        pytest
    
    - name: Test Frontend
      run: |
        cd aksara-ai-frontend
        npm install
        npm run test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./aksara-ai-backend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
        labels: ${{ steps.meta.outputs.labels }}
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./aksara-ai-frontend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/aksara-ai
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:dind
  - postgres:14

test:backend:
  stage: test
  image: python:3.10
  script:
    - cd aksara-ai-backend
    - pip install -r requirements.txt
    - pytest

test:frontend:
  stage: test
  image: node:18
  script:
    - cd aksara-ai-frontend
    - npm install
    - npm run test

build:
  stage: build
  image: docker:latest
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA ./aksara-ai-backend
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA ./aksara-ai-frontend
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
  only:
    - main

deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
        cd /opt/aksara-ai &&
        docker-compose pull &&
        docker-compose up -d &&
        docker system prune -f"
  only:
    - main
```

## 🌍 Environment Management

### Environment Separation

#### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build:
      context: ./aksara-ai-backend
      dockerfile: Dockerfile.dev
    environment:
      - ENVIRONMENT=development
      - LOG_LEVEL=DEBUG
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aksara_ai_dev
    volumes:
      - ./aksara-ai-backend:/app
    command: uvicorn main:app --reload --host 0.0.0.0

  frontend:
    build:
      context: ./aksara-ai-frontend
      dockerfile: Dockerfile.dev
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
      - VITE_DEBUG=true
    volumes:
      - ./aksara-ai-frontend:/app
      - /app/node_modules
```

#### Staging Environment
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  backend:
    image: aksaraai/backend:staging
    environment:
      - ENVIRONMENT=staging
      - LOG_LEVEL=INFO
      - DATABASE_URL=${STAGING_DATABASE_URL}
      - SECRET_KEY=${STAGING_SECRET_KEY}
    restart: unless-stopped

  frontend:
    image: aksaraai/frontend:staging
    environment:
      - VITE_API_BASE_URL=https://api-staging.aksara-ai.com
      - VITE_DEBUG=false
    restart: unless-stopped
```

#### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    image: aksaraai/backend:latest
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=WARNING
      - DATABASE_URL=${PROD_DATABASE_URL}
      - SECRET_KEY=${PROD_SECRET_KEY}
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  frontend:
    image: aksaraai/frontend:latest
    environment:
      - VITE_API_BASE_URL=https://api.aksara-ai.com
      - VITE_DEBUG=false
    restart: unless-stopped
```

### Configuration Management

#### Using Ansible
```yaml
# playbook.yml
---
- hosts: production
  become: yes
  vars:
    app_user: aksara
    app_dir: /opt/aksara-ai
    
  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: dist

    - name: Install Docker
      apt:
        name: docker.io
        state: present

    - name: Install Docker Compose
      pip:
        name: docker-compose
        state: present

    - name: Create application directory
      file:
        path: "{{ app_dir }}"
        state: directory
        owner: "{{ app_user }}"
        group: "{{ app_user }}"

    - name: Copy docker-compose.yml
      template:
        src: docker-compose.prod.yml
        dest: "{{ app_dir }}/docker-compose.yml"
        owner: "{{ app_user }}"
        group: "{{ app_user }}"

    - name: Copy environment variables
      template:
        src: .env.prod
        dest: "{{ app_dir }}/.env"
        owner: "{{ app_user }}"
        group: "{{ app_user }}"
        mode: '0600'

    - name: Start application
      docker_compose:
        project_src: "{{ app_dir }}"
        state: present
```

## 📊 Monitoring & Logging

### Prometheus and Grafana

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'aksara-ai-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Aksara AI Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active connections"
          }
        ]
      }
    ]
  }
}
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

#### Logstash Configuration
```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][app] == "aksara-ai" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    mutate {
      add_field => { "environment" => "${ENVIRONMENT:development}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "aksara-ai-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
```

#### Filebeat Configuration
```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/aksara-ai/*.log
  fields:
    app: aksara-ai
    environment: ${ENVIRONMENT}
  fields_under_root: true

output.logstash:
  hosts: ["logstash:5044"]

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
```

## 🔒 Security & SSL

### SSL Certificate with Let's Encrypt

#### Certbot Installation
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d aksara-ai.com -d www.aksara-ai.com -d api.aksara-ai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL with Nginx
```nginx
# /etc/nginx/sites-available/aksara-ai
server {
    listen 80;
    server_name aksara-ai.com www.aksara-ai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aksara-ai.com www.aksara-ai.com;
    
    ssl_certificate /etc/ssl/certs/aksara-ai.crt;
    ssl_certificate_key /etc/ssl/private/aksara-ai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        root /var/www/aksara-ai/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Hardening

#### Server Hardening
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Disable root login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Install and configure unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### Application Security
```python
# Security middleware for FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["aksara-ai.com", "*.aksara-ai.com"]
)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/users/login")
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin):
    # Login logic
    pass
```

## 🚀 Performance Optimization

### Database Optimization

#### PostgreSQL Tuning
```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.7
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

-- Create indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_chat_histories_user_id ON chat_histories(user_id);
CREATE INDEX CONCURRENTLY idx_chat_histories_created_at ON chat_histories(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE chat_histories;
ANALYZE refresh_tokens;
```

#### Redis Caching
```python
# Redis configuration
import redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
FastAPICache.init(RedisBackend(redis_client), prefix="aksara-ai")

@app.get("/chat/histories")
@cache(expire=300)  # Cache for 5 minutes
async def get_chat_histories(user_id: int):
    # Implementation
    pass
```

### Application Optimization

#### Backend Optimization
```python
# Connection pooling
from sqlalchemy.pool import QueuePool

engine = create_async_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Background tasks
from fastapi import BackgroundTasks

@app.post("/chat/message")
async def send_message(
    message: str, 
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user)
):
    # Send immediate response
    response = await ai_service.get_response(message)
    
    # Process in background
    background_tasks.add_task(save_to_history, user.id, message, response)
    
    return {"response": response}
```

#### Frontend Optimization
```typescript
// Code splitting
import { lazy, Suspense } from 'react';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  );
}

// Service worker for caching
// sw.js
const CACHE_NAME = 'aksara-ai-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 💾 Backup & Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

# Configuration
DB_NAME="aksara_ai"
DB_USER="aksara_user"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="aksara_ai_backup_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/$FILENAME

# Compress backup
gzip $BACKUP_DIR/$FILENAME

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/$FILENAME.gz s3://aksara-ai-backups/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
```

#### Cron Job Setup
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Weekly full backup
0 1 * * 0 /opt/scripts/full_backup.sh >> /var/log/backup.log 2>&1
```

### Disaster Recovery

#### Recovery Procedures
```bash
# Database recovery
# 1. Stop application
docker-compose down

# 2. Restore database
gunzip -c backup_file.sql.gz | psql -h localhost -U aksara_user -d aksara_ai

# 3. Verify data integrity
psql -h localhost -U aksara_user -d aksara_ai -c "SELECT COUNT(*) FROM users;"

# 4. Start application
docker-compose up -d

# File recovery from S3
aws s3 sync s3://aksara-ai-backups/latest/ /opt/aksara-ai/restore/
```

## 📈 Scaling Strategies

### Horizontal Scaling

#### Load Balancing with Nginx
```nginx
# nginx.conf
upstream backend_servers {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
    
    # Health checks
    keepalive 32;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
}
```

#### Database Scaling
```yaml
# Master-Slave PostgreSQL setup
# docker-compose.yml
version: '3.8'
services:
  postgres-master:
    image: postgres:14
    environment:
      - POSTGRES_DB=aksara_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replpass
    volumes:
      - ./master-init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_master_data:/var/lib/postgresql/data

  postgres-slave:
    image: postgres:14
    environment:
      - PGUSER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_MASTER_SERVICE=postgres-master
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replpass
    volumes:
      - ./slave-init.sh:/docker-entrypoint-initdb.d/init.sh
      - postgres_slave_data:/var/lib/postgresql/data
    depends_on:
      - postgres-master
```

### Auto-scaling

#### Docker Swarm Auto-scaling
```yaml
# docker-stack.yml
version: '3.8'
services:
  backend:
    image: aksaraai/backend:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
      placement:
        constraints:
          - node.role == worker
```

#### Kubernetes HPA
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: aksara-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

This comprehensive deployment guide covers all aspects of deploying Aksara AI from simple VPS setups to enterprise-grade Kubernetes deployments, including monitoring, security, and scaling strategies.