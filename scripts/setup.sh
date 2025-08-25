#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Frontend environment
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "Created .env.local from .env.example"
        else
            print_warning ".env.example not found, creating basic .env.local"
            cat > .env.local << EOF
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_LMS_INTEGRATION=true
VITE_DEBUG_MODE=true
EOF
        fi
    else
        print_success ".env.local already exists"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_success "Created backend/.env from backend/.env.example"
        else
            print_warning "backend/.env.example not found, creating basic backend/.env"
            mkdir -p backend
            cat > backend/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/financed_emissions
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret-key-change-in-production

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# External Services
LMS_PROVIDER=encompass
LMS_BASE_URL=https://api.encompass.com
EPA_API_BASE_URL=https://api.epa.gov

# Logging
LOG_LEVEL=debug
EOF
        fi
    else
        print_success "backend/.env already exists"
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    if npm install; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    if [ -d "backend" ]; then
        cd backend
        if npm install; then
            print_success "Backend dependencies installed successfully"
        else
            print_error "Failed to install backend dependencies"
            exit 1
        fi
        cd ..
    else
        print_warning "Backend directory not found. Skipping backend dependency installation."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backend/temp
    
    print_success "Directories created"
}

# Make scripts executable
make_scripts_executable() {
    print_status "Making scripts executable..."
    
    chmod +x scripts/dev.js
    chmod +x scripts/setup.sh
    
    if [ -f "scripts/build.sh" ]; then
        chmod +x scripts/build.sh
    fi
    
    if [ -f "scripts/deploy.sh" ]; then
        chmod +x scripts/deploy.sh
    fi
    
    print_success "Scripts are now executable"
}

# Check for Docker (optional)
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is available for containerized development"
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose is available"
        else
            print_warning "Docker Compose is not installed (optional)"
        fi
    else
        print_warning "Docker is not installed (optional for development)"
    fi
}

# Main setup function
main() {
    print_header "Financed Emissions Platform Setup"
    
    print_status "Starting development environment setup..."
    
    # Check prerequisites
    check_node
    check_npm
    check_docker
    
    # Setup environment
    setup_env_files
    create_directories
    make_scripts_executable
    
    # Install dependencies
    install_frontend_deps
    install_backend_deps
    
    print_header "Setup Complete!"
    
    echo -e "${GREEN}✅ Development environment is ready!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Update your environment files with actual API keys:"
    echo -e "     - ${YELLOW}.env.local${NC} (frontend configuration)"
    echo -e "     - ${YELLOW}backend/.env${NC} (backend configuration)"
    echo ""
    echo -e "  2. Start the development servers:"
    echo -e "     ${YELLOW}npm run dev${NC}                 # Start both frontend and backend"
    echo -e "     ${YELLOW}npm run dev:frontend${NC}        # Start only frontend"
    echo -e "     ${YELLOW}npm run dev:backend${NC}         # Start only backend"
    echo ""
    echo -e "  3. Or use Docker for containerized development:"
    echo -e "     ${YELLOW}npm run docker:dev${NC}          # Start with Docker Compose"
    echo ""
    echo -e "  4. Access the applications:"
    echo -e "     Frontend: ${CYAN}http://localhost:5173${NC}"
    echo -e "     Backend:  ${CYAN}http://localhost:3001${NC}"
    echo -e "     API Docs: ${CYAN}http://localhost:3001/api-docs${NC}"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Run main function
main "$@"