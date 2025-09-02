#!/bin/bash
# Start both frontend and backend for ChromaDB integration

echo "🚀 Starting PCAF Application with ChromaDB Backend..."

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo "✅ Both frontend and backend are running!"
echo "📊 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001/api"
echo "💾 ChromaDB Upload: Available in DatasetManager"
echo "Press Ctrl+C to stop both servers"

# Keep script running
wait