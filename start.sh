#!/bin/bash

echo "🚀 Starting GPX Route Viewer..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if venv exists
if [ ! -d "backend/venv" ]; then
    echo "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv backend/venv
fi

# Activate venv and install deps
echo "${BLUE}Setting up backend...${NC}"
source backend/venv/bin/activate
cd backend
pip install -r requirements.txt > /dev/null 2>&1
cd ..

# Start backend
echo "${GREEN}✓ Starting backend on http://localhost:5000${NC}"
(cd backend && source venv/bin/activate && python app.py) &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "${GREEN}✓ Starting frontend on http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "${GREEN}Both services running!${NC}"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Services stopped.'; exit" INT

# Wait for both processes
wait
