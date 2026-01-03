# Docker Setup Documentation

This document explains the Docker configuration for the Ephrathah application.

## Architecture Overview

The application uses a multi-container Docker setup with the following services:

```
┌─────────────────────────────────────────────────┐
│                 Nginx Reverse Proxy              │
│            (Port 80 - Main Entry Point)          │
└─────────────┬───────────────────────┬───────────┘
              │                       │
              │ /                     │ /api
              │                       │
    ┌─────────▼──────────┐   ┌────────▼─────────┐
    │    Frontend        │   │     Backend      │
    │   (Angular)        │   │    (NestJS)      │
    │   Port: 80         │   │   Port: 3100     │
    └────────────────────┘   └──────────┬───────┘
                                        │
                             ┌──────────▼───────────┐
                             │   PostgreSQL DB      │
                             │   Port: 5432         │
                             └──────────────────────┘
```

## Networks

1. **app-network**: Connects frontend, backend, and nginx reverse proxy
2. **postgres-network**: Connects backend and PostgreSQL database

This network separation ensures:
- Frontend cannot directly access the database
- Backend can communicate with both frontend and database
- All external traffic goes through nginx reverse proxy

## Services

### 1. PostgreSQL Database
- **Image**: postgres:16-alpine
- **Container Name**: ephrathah-postgres
- **Port**: 5432 (internal only)
- **Networks**: postgres-network
- **Volume**: postgres_data (persists database data)
- **Credentials**:
  - User: ephrathahuser
  - Password: WORD@rlwc
  - Database: ephrathahstream

### 2. Backend (NestJS)
- **Build**: ./backend/Dockerfile
- **Container Name**: ephrathah-backend
- **Port**: 3100 (internal only)
- **Networks**: postgres-network, app-network
- **Dependencies**: postgres
- **Features**:
  - Multi-stage build for optimization
  - Automatic Prisma migrations on startup
  - Production-optimized dependencies

### 3. Frontend (Angular)
- **Build**: ./frontend/Dockerfile
- **Container Name**: ephrathah-frontend
- **Port**: 80 (internal only)
- **Networks**: app-network
- **Dependencies**: backend
- **Features**:
  - Multi-stage build with nginx
  - Optimized static file serving
  - SPA routing support

### 4. Nginx Reverse Proxy
- **Image**: nginx:alpine
- **Container Name**: ephrathah-nginx
- **Port**: 80 (exposed to host)
- **Networks**: app-network
- **Dependencies**: frontend, backend
- **Routing**:
  - `/` → Frontend container
  - `/api` → Backend container (strips /api prefix)

## Getting Started

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Build and Run

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   docker-compose logs -f nginx
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (WARNING: deletes database data):**
   ```bash
   docker-compose down -v
   ```

### Rebuilding Containers

If you make changes to the code:

```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Access the Application

Once all containers are running:
- **Main Application**: http://localhost
- **Frontend**: http://localhost (same as main)
- **Backend API**: http://localhost/api

## Environment Variables

Environment variables are defined directly in `docker-compose.yml`. For production deployments, consider using:

1. **Create a `.env` file** in the root directory:
   ```bash
   cp .env.docker .env
   ```

2. **Update docker-compose.yml** to use environment file:
   ```yaml
   backend:
     env_file:
       - .env
   ```

## Development vs Production

### Current Configuration (Production-like)
- Multi-stage builds for optimization
- Production dependencies only
- Nginx for static file serving
- Automatic database migrations

### For Development
Consider creating a `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: builder  # Use builder stage
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      target: builder
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start
    ports:
      - "4200:4200"
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. View backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Manually run migrations:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

### Database connection issues
1. Verify database is running:
   ```bash
   docker-compose exec postgres pg_isready -U ephrathahuser
   ```

2. Check DATABASE_URL in backend container:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

### Port already in use
If port 80 is already in use, modify `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change to any available port
```

### Clear and rebuild everything
```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start fresh
docker-compose up -d --build
```

## File Structure

```
ephrathah/
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Files to exclude from build
│   └── ...
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── .dockerignore           # Files to exclude from build
│   ├── nginx.conf              # Frontend nginx configuration
│   └── ...
├── docker-compose.yml          # Multi-container orchestration
├── nginx.conf                  # Reverse proxy configuration
├── .env.docker                 # Environment variables template
└── DOCKER.md                   # This file
```

## Security Considerations

⚠️ **Before deploying to production:**

1. **Change default passwords**:
   - Update `POSTGRES_PASSWORD` in docker-compose.yml
   - Update `JWT_SECRET` to a strong random value

2. **Use secrets management**:
   - Don't commit `.env` files with real credentials
   - Use Docker secrets or external secret managers

3. **Enable HTTPS**:
   - Add SSL certificates to nginx
   - Update nginx.conf to listen on port 443

4. **Restrict network access**:
   - Use firewall rules
   - Don't expose database port to host

5. **Regular updates**:
   - Keep base images updated
   - Update dependencies regularly

## Additional Commands

### Execute commands in containers
```bash
# Access backend shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev

# Access PostgreSQL
docker-compose exec postgres psql -U ephrathahuser -d ephrathahstream
```

### View container resource usage
```bash
docker stats
```

### Clean up unused Docker resources
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are healthy: `docker-compose ps`
3. Consult the main README.md for application-specific documentation
