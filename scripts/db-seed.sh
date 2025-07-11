#!/bin/bash
set -e

echo "Running database seeds..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status() {
    echo "⏳ $1"
}

print_success() {
    echo "✓ $1"
}

print_error() {
    echo "✗ $1"
}

check_env() {
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_error ".env file not found"
        exit 1
    fi
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker not running"
        exit 1
    fi
}

wait_for_db() {
    print_status "Waiting for database..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec nn-seca-tms-db pg_isready -U postgres > /dev/null 2>&1; then
            print_success "Database ready"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Database not ready"
    return 1
}

run_seeds() {
    print_status "Running database seeds..."
    
    cd "$PROJECT_ROOT/server" || exit 1
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing server dependencies..."
        if npm install; then
            print_success "Server dependencies installed"
        else
            print_error "Failed to install server dependencies"
            return 1
        fi
    fi
    
    if npm run seed; then
        print_success "Database seeding completed successfully"
    else
        print_error "Database seeding failed"
        return 1
    fi
}

main() {
    check_env
    check_docker
    wait_for_db
    run_seeds
    
    echo "✓ Database seeding complete!"
}

main "$@" 