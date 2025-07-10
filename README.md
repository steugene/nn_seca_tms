# NN SECA Task Management System

Task management system built with Angular and NestJS. Provides a Trello-like interface for managing boards, columns, and tickets with real-time updates.

## Features

- User authentication with JWT tokens
- Board and ticket management
- Real-time updates via WebSockets
- Drag & drop ticket movement
- User assignment
- Angular Material UI

## Tech Stack

- **Frontend**: Angular 17, Angular Material, Socket.IO
- **Backend**: NestJS, TypeORM, PostgreSQL, Socket.IO
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: WebSocket

## Quick Start

### Prerequisites

- Node.js (>=18.0.0)
- Docker and Docker Compose

### Setup

```bash
# Clone and setup
git clone <repository-url>
cd nn_seca_tms
make setup

# Start development environment
make dev

# Setup database (in another terminal)
make db-setup
```

### Access

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

### Default Users

The database is seeded with test users:

```
admin@nnseca.com   | AdminPass123!
alice@nnseca.com   | AlicePass123!
bob@nnseca.com     | BobPass123!
charlie@nnseca.com | CharliePass123!
diana@nnseca.com   | DianaPass123!
```

## Available Commands

```bash
make setup     # Complete project setup
make dev       # Start development environment
make db-setup  # Setup database with migrations and seeds
make db-reset  # Reset database
make build     # Build applications
make test      # Run tests
make lint      # Run linting
make clean     # Clean containers and volumes
```

## Environment Variables

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nn_seca_tms

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:4200
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token

### Boards
- `GET /boards` - Get all boards
- `POST /boards` - Create board
- `GET /boards/:id` - Get board by ID
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

### Tickets
- `GET /tickets` - Get all tickets
- `POST /tickets` - Create ticket
- `GET /tickets/:id` - Get ticket by ID
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket
- `PUT /tickets/:id/move` - Move ticket

### Users
- `GET /users` - Get all users
- `GET /users/profile` - Get user profile

## WebSocket Events

- `ticket_created` - New ticket created
- `ticket_updated` - Ticket updated
- `ticket_deleted` - Ticket deleted
- `ticket_moved` - Ticket moved between columns
- `user_joined_board` - User joined board
- `user_left_board` - User left board

## Development

Run individual services:

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev

# Shared types
cd shared && npm run build:watch
```

## Testing

```bash
npm run test                    # All tests
npm run test --workspace=server # Server tests
npm run test --workspace=client # Client tests
```

## Production

```bash
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

## License

MIT 