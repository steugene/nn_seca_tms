.PHONY: help setup install dev build test lint clean stop logs db-setup db-reset db-seed shared

help:
	@echo "Available commands:"
	@echo "  setup     - Complete project setup"  
	@echo "  dev       - Start development environment"
	@echo "  build     - Build applications"
	@echo "  test      - Run tests"
	@echo "  db-setup  - Setup database"
	@echo "  db-seed   - Run database seeds only"
	@echo "  clean     - Clean containers"

setup:
	@echo "Starting complete project setup..."
	chmod +x scripts/setup-env.sh
	./scripts/setup-env.sh
	npm run build --workspace=shared
	docker-compose up -d
	sleep 15
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh
	@echo "Setup complete! Run 'make dev' to start development."

install:
	npm install

dev:
	npm run build --workspace=shared
	docker-compose up --build

db-setup:
	@echo "Setting up database..."
	@if ! docker ps | grep -q nn-seca-tms-db; then \
		echo "Database container not running. Starting containers..."; \
		docker-compose up -d; \
		sleep 15; \
	fi
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh

db-reset:
	@echo "Resetting database..."
	@if ! docker ps | grep -q nn-seca-tms-db; then \
		echo "Database container not running. Starting containers..."; \
		docker-compose up -d; \
		sleep 15; \
	fi
	chmod +x scripts/db-setup.sh
	./scripts/db-setup.sh --reset

db-seed:
	@echo "Running database seeds..."
	@if ! docker ps | grep -q nn-seca-tms-db; then \
		echo "Database container not running. Starting containers..."; \
		docker-compose up -d; \
		sleep 15; \
	fi
	chmod +x scripts/db-seed.sh
	./scripts/db-seed.sh

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

clean:
	docker-compose down -v
	docker system prune -f
	npm run clean

stop:
	docker-compose down

logs:
	docker-compose logs -f

shared:
	@echo "Rebuilding shared library..."
	npm run build --workspace=shared
	@echo "Shared library rebuilt successfully!" 