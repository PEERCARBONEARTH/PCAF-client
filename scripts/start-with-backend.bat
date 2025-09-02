@echo off
REM Start PCAF Application with Hosted ChromaDB Integration

echo 🚀 Starting PCAF Application with Hosted ChromaDB...

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Start backend server in background
echo 🔧 Starting backend server (connects to hosted ChromaDB)...
start "PCAF Backend" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo 🎨 Starting frontend...
npm run dev

echo ✅ Application is running with hosted ChromaDB!
echo 📊 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3001/api
echo 💾 ChromaDB Upload: Available in DatasetManager (no Python required!)

pause