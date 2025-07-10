.PHONY: help setup install dev build test lint clean stop logs db-setup db-reset db-seed shared

help:
	@echo "Available commands:"
	@echo "  setup     - Complete project setup"  
	@echo "  dev       - Start development environment"
	@echo "  build     - Build applications"
	@echo "  test      - Run tests"
	@echo "  db-setup  - Setup database"
	@echo "  clean     - Clean containers"

setup:
	chmod +x scripts/setup-env.sh
	./scripts/setup-env.sh
	npm run build --workspace=shared
	docker-compose up -d
	sleep 15
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh

install:
	npm install

dev:
	npm run build --workspace=shared
	docker-compose up --build

# Database setup (run after containers are up)
db-setup:
	@echo "Setting up database..."
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh

# Reset database
db-reset:
	@echo "Resetting database..."
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh --reset

# Run database seeds only
db-seed:
	@echo "Running database seeds..."
	cd server && npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts

# Build applications
build:
	npm run build

# Run tests
test:
	npm run test

# Run linting
lint:
	npm run lint

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f
	npm run clean

# Stop running containers
stop:
	docker-compose down

# Show container logs
logs:
	docker-compose logs -f

# Rebuild shared library only
shared:
	@echo "Rebuilding shared library..."
	npm run build --workspace=shared
	@echo "Shared library rebuilt successfully!" 