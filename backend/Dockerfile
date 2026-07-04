# ==========================================
# Dockerfile multi-stage (Prisma + PostgreSQL)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
USER node

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

# Applique migrations Prisma au démarrage puis lance le serveur
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
