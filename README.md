# MediaPortal

A full-stack web application with NestJS backend and Angular frontend, featuring authentication and user management.

## Features

- User authentication with JWT tokens
- Username-based login (no email required)
- User registration with username, password, contact number, and live mode preference
- Profile management
- Secure password hashing with bcrypt
- PostgreSQL database with Prisma ORM
- RESTful API
- Responsive UI with modern design

## Tech Stack

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport.js
- bcrypt

### Frontend
- Angular 21
- Reactive Forms
- HTTP Client with Interceptors
- Angular Router

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Quick Start (Recommended)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment variables
cd backend
cp .env.example .env
# Update .env with your database credentials
cd ..

# 3. Setup database
# Create PostgreSQL database first:
# psql -U postgres -c "CREATE DATABASE mediaportal;"

# Generate Prisma Client and run migrations
npm run prisma:generate
npm run prisma:migrate

# 4. Run both backend and frontend together
npm run dev
```

The backend will be running at `http://localhost:3100` and frontend at `http://localhost:4200`

## Detailed Setup Instructions

### 1. Database Setup

**Option 1: Using SQL Script (Manual)**
```bash
# Create database and run setup script
psql -U postgres -c "CREATE DATABASE ephrathahstream;"
psql -U postgres -d ephrathahstream -f database/setup.sql

# Optional: Add sample data for testing
psql -U postgres -d ephrathahstream -f database/seed.sql
```

**Option 2: Let Prisma handle it (Recommended)**
```bash
# Create the database manually first
psql -U postgres -c "CREATE DATABASE ephrathahstream;"

# Prisma will create tables when you run migrations (step 4)
```

For detailed database documentation, see `database/README.md`

### 2. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

### 3. Backend Configuration

```bash
cd backend

# Configure environment variables
cp .env.example .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mediaportal?schema=public"
# JWT_SECRET="your-secret-key-change-this-in-production"
# JWT_EXPIRATION="24h"
# PORT=3100

cd ..
```

### 4. Database Migration

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start Development Servers

**Option 1: Run both together (Recommended)**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The backend will be running at `http://localhost:3100` and frontend at `http://localhost:4200`

## Database Schema

### User Model

| Field         | Type     | Description                          |
|---------------|----------|--------------------------------------|
| id            | Integer  | Primary key (auto-increment)         |
| username      | String   | Unique username (not email)          |
| password      | String   | Hashed password                      |
| contactNumber | String   | User's contact number                |
| liveMode      | String   | Preference: "audio" or "video"       |
| createdAt     | DateTime | Timestamp of account creation        |
| updatedAt     | DateTime | Timestamp of last update             |

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "contactNumber": "+1234567890",
  "liveMode": "audio"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "contactNumber": "+1234567890",
    "liveMode": "audio"
  }
}
```

### User Management

#### Get Profile (Protected)
```http
GET /users/profile
Authorization: Bearer <access_token>
```

#### Update Profile (Protected)
```http
PUT /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "newpassword123",
  "contactNumber": "+0987654321",
  "liveMode": "video"
}
```

## Application Structure

```
MediaPortal/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── prisma/         # Prisma service
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/       # Auth service & interceptor
│   │   │   ├── login/      # Login component
│   │   │   ├── profile/    # Profile component
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   └── main.ts
│   └── package.json
├── database/
│   ├── setup.sql           # Database setup script
│   ├── rollback.sql        # Database cleanup script
│   ├── seed.sql            # Sample data script
│   ├── quick-start.sh      # Setup automation (Unix/Mac)
│   ├── quick-start.bat     # Setup automation (Windows)
│   └── README.md           # Database documentation
├── package.json            # Root package with scripts
└── README.md
```

## Development

### Root-Level Commands (From project root)

```bash
# Run both backend and frontend together
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Install all dependencies
npm run install:all

# Build both projects
npm run build

# Database commands
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Create and apply migration
npm run prisma:studio        # Open Prisma Studio (Database GUI)
```

### Backend Commands (From backend directory)

```bash
cd backend

# Start development server
npm run start:dev

# Build for production
npm run build

# Run production server
npm run start:prod

# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Frontend Commands (From frontend directory)

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens for stateless authentication
- HTTP-only token storage in localStorage
- CORS enabled for frontend communication
- Input validation using class-validator
- SQL injection prevention via Prisma ORM

## Notes

- No forgot password feature (as per requirements)
- Username-based authentication (not email-based)
- Live mode can be either "audio" or "video"
- Default live mode is set to "audio"

## License

This project is licensed under the ISC License.
