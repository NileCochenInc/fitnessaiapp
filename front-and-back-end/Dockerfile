# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install ALL dependencies (dev + prod)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js app
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built Next.js files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Create startup wrapper script with error handling
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== Container Starting ===" >&2' >> /app/start.sh && \
    echo 'echo "NODE_ENV: $NODE_ENV" >&2' >> /app/start.sh && \
    echo 'echo "DATABASE_URL configured: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")" >&2' >> /app/start.sh && \
    echo 'echo "NEXTAUTH_URL configured: $([ -n "$NEXTAUTH_URL" ] && echo "YES" || echo "NO")" >&2' >> /app/start.sh && \
    echo 'echo "Current directory: $(pwd)" >&2' >> /app/start.sh && \
    echo 'echo "Files in .next: $(ls -la .next/ 2>&1 | wc -l) files found" >&2' >> /app/start.sh && \
    echo 'echo "Starting Node server..." >&2' >> /app/start.sh && \
    echo 'exec node .next/standalone/server.js 2>&1' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start production server with all output to stderr so we can capture it
CMD ["/app/start.sh"]
