# Multi-stage production build for SchemeSetu Backend API (SIH26092)
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/
COPY .env.example ./

# Expose API port
EXPOSE 5000

# Create logs directory and ensure permissions
RUN mkdir -p /app/logs && chown -R node:node /app

# Non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/index.js"]
