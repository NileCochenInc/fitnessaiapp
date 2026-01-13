# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the code
COPY . .

# Expose dev port
EXPOSE 3000

# Start Next.js in dev mode for hot reload
CMD ["pnpm", "dev"]