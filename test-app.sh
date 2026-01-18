#!/bin/bash

echo "============================================"
echo "Testing 3-Tier Application"
echo "============================================"

# Test MongoDB
echo -e "\n[1/4] MongoDB Status:"
if docker ps | grep -q taskmanager-mongo; then
    echo "✓ MongoDB is running"
else
    echo "✗ MongoDB is NOT running"
fi

# Test Backend
echo -e "\n[2/4] Backend API Status:"
HEALTH=$(curl -s http://localhost:5000/health)
if [ ! -z "$HEALTH" ]; then
    echo "✓ Backend is running on port 5000"
    echo "  Response: $HEALTH"
else
    echo "✗ Backend is NOT responding"
fi

# Test Backend API Info
echo -e "\n[3/4] Backend API Info:"
API_INFO=$(curl -s http://localhost:5000/)
if [ ! -z "$API_INFO" ]; then
    echo "✓ API endpoints available"
    echo "  $API_INFO"
else
    echo "✗ API not responding"
fi

# Test Frontend
echo -e "\n[4/4] Frontend Status:"
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
    echo "✓ Frontend is running on port 3000"
    echo "  Access at: http://localhost:3000"
else
    echo "✗ Frontend is NOT responding (HTTP $FRONTEND)"
fi

echo -e "\n============================================"
echo "Test Complete!"
echo "============================================"
echo -e "\nTo access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API Docs: http://localhost:5000/api/v1"
