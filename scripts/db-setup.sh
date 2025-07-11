#!/bin/bash
set -e

echo "Setting up database..."

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

print_warning() {
    echo "⚠ $1"
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
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec nn-seca-tms-db pg_isready -U postgres > /dev/null 2>&1; then
            print_success "Database ready"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Database failed to start"
    return 1
}

run_migrations() {
    print_status "Running database migrations..."
    
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
    
    if npm run migration:run; then
        print_success "Migrations completed successfully"
    else
        print_error "Migration failed"
        return 1
    fi
}

run_seeds() {
    print_status "Running database seeds..."
    
    cd "$PROJECT_ROOT/server" || exit 1
    
    if npm run seed; then
        print_success "Database seeding completed successfully"
    else
        print_error "Database seeding failed"
        return 1
    fi
}

create_database() {
    print_status "Ensuring database exists..."
    
    DB_NAME=$(grep "^DB_NAME=" "$PROJECT_ROOT/.env" | cut -d '=' -f2)
    if [ -z "$DB_NAME" ]; then
        DB_NAME="nn_seca_tms"
    fi
    
    if docker exec nn-seca-tms-db psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_success "Database '$DB_NAME' already exists"
    else
        print_status "Creating database '$DB_NAME'..."
        if docker exec nn-seca-tms-db createdb -U postgres "$DB_NAME"; then
            print_success "Database '$DB_NAME' created successfully"
        else
            print_error "Failed to create database '$DB_NAME'"
            return 1
        fi
    fi
}

enable_uuid_extension() {
    print_status "Enabling UUID extension..."
    
    DB_NAME=$(grep "^DB_NAME=" "$PROJECT_ROOT/.env" | cut -d '=' -f2)
    if [ -z "$DB_NAME" ]; then
        DB_NAME="nn_seca_tms"
    fi
    
    if docker exec nn-seca-tms-db psql -U postgres -d "$DB_NAME" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' > /dev/null 2>&1; then
        print_success "UUID extension enabled"
    else
        print_warning "UUID extension might already be enabled or failed to enable"
    fi
}

check_connection() {
    print_status "Testing database connection..."
    
    cd "$PROJECT_ROOT/server" || exit 1
    
    if timeout 30 npx ts-node -e "
    import { AppDataSource } from './src/database/data-source';
    AppDataSource.initialize()
      .then(() => {
        console.log('Database connection successful');
        return AppDataSource.destroy();
      })
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
      });
    "; then
        print_success "Database connection test passed"
    else
        print_error "Database connection test failed"
        return 1
    fi
}

reset_database() {
    if [ "$1" = "--reset" ]; then
        print_warning "Resetting database..."
        
        DB_NAME=$(grep "^DB_NAME=" "$PROJECT_ROOT/.env" | cut -d '=' -f2)
        if [ -z "$DB_NAME" ]; then
            DB_NAME="nn_seca_tms"
        fi
        
        docker exec nn-seca-tms-db dropdb -U postgres "$DB_NAME" --if-exists
        docker exec nn-seca-tms-db createdb -U postgres "$DB_NAME"
        enable_uuid_extension
        print_success "Database reset completed"
    fi
}

main() {
    case "$1" in
        --help)
            echo "Usage: $0 [--reset]"
            exit 0
            ;;
    esac
    
    check_env
    check_docker
    wait_for_db
    reset_database "$1"
    create_database
    enable_uuid_extension
    run_migrations
    run_seeds
    check_connection
    
    echo "✓ Database setup complete!"
}

main "$@" 