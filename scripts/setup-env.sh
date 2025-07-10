#!/bin/bash
set -e

echo "Setting up environment..."

create_env_file() {
    if [ ! -f ".env" ]; then
        echo "Creating .env file..."
        cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nn_seca_tms

JWT_SECRET=nn-seca-tms-super-secret-jwt-key-change-this-in-production-256-bits
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=nn-seca-tms-super-secret-refresh-key-change-this-in-production-256-bits
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:4200

CORS_ORIGIN=http://localhost:4200
CORS_CREDENTIALS=true

LOG_LEVEL=debug
EOF
        echo "✓ .env file created"
    else
        echo "✓ .env file exists"
    fi
}

create_server_env() {
    if [ ! -f "server/.env" ]; then
        cp .env server/.env
        echo "✓ server/.env created"
    fi
}

install_dependencies() {
    echo "Installing dependencies..."
    npm install
}

build_shared() {
    echo "Building shared types..."
    npm run build --workspace=shared
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "✗ Docker not running"
        exit 1
    fi
}

main() {
    check_docker
    create_env_file
    create_server_env
    install_dependencies
    build_shared
    echo "✓ Setup complete!"
}

main 