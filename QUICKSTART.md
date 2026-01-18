# Quick Start Guide

Get the Task Management application running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check MongoDB (optional if using Docker)
mongod --version

# Check Docker (optional)
docker --version
```

## Quick Setup (Local)

### 1. Clone and Navigate
```bash
cd /workspaces/3-tier-devops-app
```

### 2. Setup Database

**Option A: Using Docker (Recommended)**
```bash
docker run -d \
  --name taskmanager-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=taskmanagement \
  mongo:7
```

**Option B: Local MongoDB**
Just ensure MongoDB is running on `localhost:27017`

### 3. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start backend server
npm run dev
```

Backend running at: **http://localhost:5000**

### 4. Setup Frontend (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start frontend server
npm run dev
```

Frontend running at: **http://localhost:3000**

### 5. Test the Application

1. Open browser: http://localhost:3000
2. Click "Sign up" to create an account
3. Register with:
   - Username: testuser
   - Email: test@example.com
   - Password: test123
4. Login and explore!

## Quick API Test

```bash
# Health check
curl http://localhost:5000/health

# Get API info
curl http://localhost:5000/

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart MongoDB container
docker restart taskmanager-mongo
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

```bash
# Backend changes (hot reload enabled)
cd backend
npm run dev

# Frontend changes (hot reload enabled)
cd frontend
npm run dev

# View logs
# Backend: Check terminal running npm run dev
# Frontend: Check browser console
```

## What to Learn Next

1. ✅ **You've completed**: Local setup
2. 🔜 **Next steps**:
   - Explore API endpoints
   - Understand the codebase structure
   - Create Docker containers
   - Set up CI/CD pipeline
   - Deploy to Kubernetes

## Need Help?

Check the main [README.md](README.md) for:
- Full documentation
- API reference
- DevOps learning path
- Architecture details

---

**You're all set! Start building and learning! 🎉**
