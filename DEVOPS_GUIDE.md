# DevOps Implementation Guide

This guide provides step-by-step instructions for implementing DevOps practices with this application.

## Table of Contents

1. [Containerization with Docker](#1-containerization-with-docker)
2. [CI/CD with GitHub Actions](#2-cicd-with-github-actions)
3. [Kubernetes Deployment](#3-kubernetes-deployment)
4. [Load Balancing & Ingress](#4-load-balancing--ingress)
5. [Monitoring & Logging](#5-monitoring--logging)
6. [Infrastructure as Code](#6-infrastructure-as-code)

---

## 1. Containerization with Docker

### Step 1.1: Backend Dockerfile

Replace the placeholder in `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 5000

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### Step 1.2: Frontend Dockerfile

Replace the placeholder in `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 1.3: Docker Compose

Replace `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: taskmanager-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./database/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    environment:
      MONGO_INITDB_DATABASE: taskmanagement
    networks:
      - taskmanager-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/taskmanagement --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongo:27017/taskmanagement
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - taskmanager-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:5000
    depends_on:
      - backend
    networks:
      - taskmanager-network

volumes:
  mongo-data:

networks:
  taskmanager-network:
    driver: bridge
```

### Step 1.4: Build and Run

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 2. CI/CD with GitHub Actions

Replace `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run tests
        working-directory: ./backend
        run: npm test
      
      - name: Run linter
        working-directory: ./backend
        run: npm run lint || true

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint

  build-and-push:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        component: [backend, frontend]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.component }}
          tags: |
            type=sha,prefix={{branch}}-
            type=ref,event=branch
            type=semver,pattern={{version}}
            latest
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./${{ matrix.component }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Kubernetes
        run: |
          echo "Deployment step - configure kubectl and apply manifests"
          # kubectl apply -f k8s/
```

---

## 3. Kubernetes Deployment

### Step 3.1: Backend Deployment

Replace `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: taskmanager
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskmanager
      component: backend
  template:
    metadata:
      labels:
        app: taskmanager
        component: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-username/taskmanager-backend:latest
        ports:
        - containerPort: 5000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### Step 3.2: Frontend Deployment

Replace `k8s/frontend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: taskmanager
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: taskmanager
      component: frontend
  template:
    metadata:
      labels:
        app: taskmanager
        component: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/your-username/taskmanager-frontend:latest
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
```

### Step 3.3: Services

Update service files similarly. See the full templates in the k8s/ directory.

### Step 3.4: Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace taskmanager

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri='mongodb://mongo:27017/taskmanagement' \
  --from-literal=jwt-secret='your-secret-key' \
  -n taskmanager

# Apply all manifests
kubectl apply -f k8s/ -n taskmanager

# Check status
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager
```

---

## 4. Load Balancing & Ingress

Replace `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: taskmanager-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - taskmanager.yourdomain.com
    secretName: taskmanager-tls
  rules:
  - host: taskmanager.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

Install NGINX Ingress Controller:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

---

## 5. Monitoring & Logging

### Prometheus Configuration

Replace `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

Deploy Prometheus and Grafana:

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

---

## 6. Infrastructure as Code

Replace `terraform/main.tf`:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "taskmanager-vpc"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "taskmanager-cluster"
  cluster_version = "1.27"

  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 4

      instance_types = ["t3.medium"]
    }
  }
}
```

Apply Terraform:

```bash
cd terraform

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

---

## Next Steps

1. **Security Hardening**
   - Implement network policies
   - Set up RBAC
   - Enable pod security policies
   - Add secret encryption

2. **Performance Optimization**
   - Configure HPA (Horizontal Pod Autoscaler)
   - Set up CDN
   - Optimize database queries
   - Implement caching (Redis)

3. **Disaster Recovery**
   - Automated backups
   - Multi-region deployment
   - Failover testing

4. **Cost Optimization**
   - Right-size resources
   - Use spot instances
   - Implement auto-scaling

For detailed information on each section, refer to the official documentation of each tool.
