@echo off
setlocal enabledelayedexpansion

:: Colors (limited support in Windows CMD)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "PURPLE=[95m"
set "CYAN=[96m"
set "NC=[0m"

echo %PURPLE%================================%NC%
echo %PURPLE%Financed Emissions Platform Setup%NC%
echo %PURPLE%================================%NC%
echo.

echo %BLUE%[INFO]%NC% Starting development environment setup...
echo.

:: Check if Node.js is installed
echo %BLUE%[INFO]%NC% Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do (
    set "NODE_MAJOR=%%a"
    set "NODE_MAJOR=!NODE_MAJOR:v=!"
)

if !NODE_MAJOR! LSS 18 (
    echo %RED%[ERROR]%NC% Node.js version 18 or higher is required.
    node --version
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% Node.js is installed
node --version

:: Check if npm is installed
echo %BLUE%[INFO]%NC% Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% npm is installed
npm --version

:: Setup environment files
echo %BLUE%[INFO]%NC% Setting up environment files...

:: Frontend environment
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo %GREEN%[SUCCESS]%NC% Created .env.local from .env.example
    ) else (
        echo %YELLOW%[WARNING]%NC% .env.example not found, creating basic .env.local
        (
            echo # Backend API Configuration
            echo VITE_API_BASE_URL=http://localhost:3001/api
            echo VITE_WS_URL=ws://localhost:3001
            echo.
            echo # Authentication
            echo VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
            echo.
            echo # Feature Flags
            echo VITE_ENABLE_REAL_TIME=true
            echo VITE_ENABLE_AI_FEATURES=true
            echo VITE_ENABLE_LMS_INTEGRATION=true
            echo VITE_DEBUG_MODE=true
        ) > .env.local
    )
) else (
    echo %GREEN%[SUCCESS]%NC% .env.local already exists
)

:: Backend environment
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo %GREEN%[SUCCESS]%NC% Created backend\.env from backend\.env.example
    ) else (
        echo %YELLOW%[WARNING]%NC% backend\.env.example not found, creating basic backend\.env
        if not exist "backend" mkdir backend
        (
            echo # Server Configuration
            echo NODE_ENV=development
            echo PORT=3001
            echo.
            echo # Database
            echo MONGODB_URI=mongodb://localhost:27017/financed_emissions
            echo REDIS_URL=redis://localhost:6379
            echo.
            echo # Authentication
            echo JWT_SECRET=your-jwt-secret-key-change-in-production
            echo.
            echo # AI Services
            echo OPENAI_API_KEY=your_openai_api_key_here
            echo PINECONE_API_KEY=your_pinecone_api_key_here
            echo PINECONE_ENVIRONMENT=your_pinecone_environment_here
            echo.
            echo # External Services
            echo LMS_PROVIDER=encompass
            echo LMS_BASE_URL=https://api.encompass.com
            echo EPA_API_BASE_URL=https://api.epa.gov
            echo.
            echo # Logging
            echo LOG_LEVEL=debug
        ) > backend\.env
    )
) else (
    echo %GREEN%[SUCCESS]%NC% backend\.env already exists
)

:: Create necessary directories
echo %BLUE%[INFO]%NC% Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "temp" mkdir temp
if not exist "backend\logs" mkdir backend\logs
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\temp" mkdir backend\temp
echo %GREEN%[SUCCESS]%NC% Directories created

:: Install frontend dependencies
echo %BLUE%[INFO]%NC% Installing frontend dependencies...
npm install
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install frontend dependencies
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Frontend dependencies installed successfully

:: Install backend dependencies
echo %BLUE%[INFO]%NC% Installing backend dependencies...
if exist "backend" (
    cd backend
    npm install
    if errorlevel 1 (
        echo %RED%[ERROR]%NC% Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo %GREEN%[SUCCESS]%NC% Backend dependencies installed successfully
) else (
    echo %YELLOW%[WARNING]%NC% Backend directory not found. Skipping backend dependency installation.
)

:: Check for Docker (optional)
echo %BLUE%[INFO]%NC% Checking for Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% Docker is not installed (optional for development)
) else (
    echo %GREEN%[SUCCESS]%NC% Docker is available for containerized development
    docker --version
    
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo %YELLOW%[WARNING]%NC% Docker Compose is not installed (optional)
    ) else (
        echo %GREEN%[SUCCESS]%NC% Docker Compose is available
        docker-compose --version
    )
)

echo.
echo %PURPLE%================================%NC%
echo %PURPLE%Setup Complete!%NC%
echo %PURPLE%================================%NC%
echo.

echo %GREEN%✅ Development environment is ready!%NC%
echo.
echo %CYAN%Next steps:%NC%
echo   1. Update your environment files with actual API keys:
echo      - %YELLOW%.env.local%NC% (frontend configuration)
echo      - %YELLOW%backend\.env%NC% (backend configuration)
echo.
echo   2. Start the development servers:
echo      %YELLOW%npm run dev%NC%                 # Start both frontend and backend
echo      %YELLOW%npm run dev:frontend%NC%        # Start only frontend
echo      %YELLOW%npm run dev:backend%NC%         # Start only backend
echo.
echo   3. Or use Docker for containerized development:
echo      %YELLOW%npm run docker:dev%NC%          # Start with Docker Compose
echo.
echo   4. Access the applications:
echo      Frontend: %CYAN%http://localhost:5173%NC%
echo      Backend:  %CYAN%http://localhost:3001%NC%
echo      API Docs: %CYAN%http://localhost:3001/api-docs%NC%
echo.
echo %GREEN%Happy coding! 🚀%NC%
echo.

pause