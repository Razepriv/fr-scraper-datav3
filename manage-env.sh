#!/bin/bash
# Environment Configuration Script
# Usage: ./manage-env.sh [development|production|setup]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to setup development environment
setup_development() {
    print_status "Setting up development environment..."
    
    if [ -f ".env.local" ]; then
        print_status "Development environment already configured (.env.local exists)"
    else
        print_warning ".env.local not found, creating from .env.example"
        cp .env.example .env.local
        print_status "Created .env.local for development"
    fi
    
    # Update .env for development
    print_status "Configuring .env for development..."
    sed -i 's/NODE_ENV=production/NODE_ENV=development/' .env
    sed -i 's/STORAGE_TYPE=database/STORAGE_TYPE=filesystem/' .env
    sed -i 's/UPLOAD_PROVIDER=firebase/UPLOAD_PROVIDER=local/' .env
    
    print_status "Development environment configured successfully!"
    print_warning "Make sure to update Firebase credentials in .env.local if needed"
}

# Function to setup production environment
setup_production() {
    print_status "Setting up production environment..."
    
    # Update .env for production
    print_status "Configuring .env for production..."
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
    sed -i 's/STORAGE_TYPE=filesystem/STORAGE_TYPE=database/' .env
    sed -i 's/UPLOAD_PROVIDER=local/UPLOAD_PROVIDER=firebase/' .env
    
    print_status "Production environment configured successfully!"
    print_warning "Make sure all Firebase credentials are correctly set for production"
}

# Function to validate environment
validate_env() {
    print_status "Validating environment configuration..."
    
    # Check required files
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        exit 1
    fi
    
    # Check Firebase credentials
    if ! grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=" .env; then
        print_error "Firebase API key not found in .env"
        exit 1
    fi
    
    # Check Node.js environment
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    else
        print_error "Node.js not found!"
        exit 1
    fi
    
    # Check Firebase CLI
    if command -v firebase &> /dev/null; then
        FIREBASE_VERSION=$(firebase --version)
        print_status "Firebase CLI version: $FIREBASE_VERSION"
    else
        print_warning "Firebase CLI not found. Install with: npm install -g firebase-tools"
    fi
    
    print_status "Environment validation completed!"
}

# Main script logic
case "${1:-setup}" in
    "development"|"dev")
        setup_development
        validate_env
        ;;
    "production"|"prod")
        setup_production
        validate_env
        ;;
    "setup"|"init")
        print_status "Initial environment setup..."
        setup_development
        validate_env
        print_status "Run 'npm run dev' to start development server"
        ;;
    "validate"|"check")
        validate_env
        ;;
    *)
        echo "Usage: $0 [development|production|setup|validate]"
        echo "  development - Configure for development"
        echo "  production  - Configure for production"
        echo "  setup       - Initial setup (defaults to development)"
        echo "  validate    - Validate current configuration"
        exit 1
        ;;
esac
