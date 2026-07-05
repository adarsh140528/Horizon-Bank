# Multi-stage build for production backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Run stage - clean minimal production environment
FROM node:20-alpine AS runner

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy source code from builder stage
COPY --from=builder /app /app

# Express server default port
EXPOSE 5000

ENV NODE_ENV=production

# Start command
CMD ["npm", "start"]
