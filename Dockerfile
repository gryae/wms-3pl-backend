# =============================================
# BUILD / DEVELOPMENT STAGE
# =============================================
FROM node:20-alpine AS development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# =============================================
# PRODUCTION BUILD STAGE
# =============================================
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
# Keep devDependencies for prisma CLI in production
RUN npm prune --production
RUN npm install prisma --save-dev --ignore-scripts

# =============================================
# PRODUCTION RUNNER STAGE
# =============================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY entrypoint.sh ./entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/uploads && \
    chmod +x /app/entrypoint.sh

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["/app/entrypoint.sh"]
