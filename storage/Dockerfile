FROM node:18-alpine

# Install system dependencies for encryption and storage
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create data directory for encrypted storage
RUN mkdir -p /app/data /app/temp && chown -R nodejs:nodejs /app

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3003/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "index.js"]