# =======================
# Multi-Stage Dockerfile
# =======================

# -------- Build Stage -------- #
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy full source code
COPY . .

# Dummy DATABASE_URL for prisma generate (no .env in build; prisma.config uses it)
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/dummy

# Generate Prisma client
RUN npx prisma generate

# Build the project
RUN npm run build

# Verify build output
RUN test -d /app/dist || (echo "Build failed - dist directory not found" && exit 1)
RUN test -f /app/dist/server.js || (echo "Build failed - dist/server.js not found" && exit 1)


# -------- Runtime Stage -------- #
FROM node:20-alpine

WORKDIR /app

# Install production deps + Prisma CLI (needed for `prisma migrate deploy` via exec)
COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

# Copy built app and Prisma artifacts (migrations, schema, config for migrate deploy)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create non-root user and fix ownership
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
