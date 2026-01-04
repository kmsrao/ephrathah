# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all files needed for build
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY prisma.config.js ./
COPY prisma ./prisma/
COPY src ./src/

# Install dependencies (including dev dependencies for build)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Debug: Show what was built
RUN echo "=== Checking build output ===" && \
    ls -la dist/ && \
    echo "=== Contents of dist ===" && \
    find dist -type f -name "*.js" | head -20

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.js ./
COPY prisma ./prisma/

# Install all dependencies (needed for prisma.config.js execution)
RUN npm install

# Copy Prisma generated files from builder
COPY --from=builder /app/generated ./generated

# Generate Prisma client in production
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Debug: Verify what was copied
RUN echo "=== Production stage - dist folder ===" && \
    ls -la dist/ && \
    echo "=== Looking for main.js ===" && \
    find dist -name "main.js" -o -name "main.ts"

# Expose port
EXPOSE 3100

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && echo '=== Runtime dist check ===' && ls -la dist/ && find dist -name 'main.*' && npm run start:prod"]
