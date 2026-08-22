# ADAN-ID OpenCloud - Storage Service Container
# ADANiD-AI Organization | Sovereign Cloud Storage
# Auto-deployed: 2026-08-22

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S adan && \
    adduser -S -u 1001 -G adan adan

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=adan:adan . .

# Create data directory
RUN mkdir -p /app/data && chown adan:adan /app/data

# Switch to non-root user
USER adan

# Expose storage service port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start storage service
CMD ["node", "index.js"]
