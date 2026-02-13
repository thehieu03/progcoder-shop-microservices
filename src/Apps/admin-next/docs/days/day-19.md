# Day 19: Docker

## Mục tiêu
Containerize ứng dụng với Docker.

## Dockerfile

```dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ARG NEXT_PUBLIC_API_GATEWAY

# Environment variables
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ENV NEXT_PUBLIC_API_GATEWAY=$NEXT_PUBLIC_API_GATEWAY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

## docker-compose.yml

```yaml
version: "3.8"

services:
  admin-next:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
        - NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
        - NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}
        - NEXT_PUBLIC_API_GATEWAY=${NEXT_PUBLIC_API_GATEWAY}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # Optional: Keycloak for local development
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    command: start-dev
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_DB=dev-file
```

## .dockerignore

```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
.env.local
```

## Build Commands

```bash
# Build Docker image
docker build -t admin-next .

# Run container
docker run -p 3000:3000 --env-file .env.local admin-next

# Using docker-compose
docker-compose up --build
```

## Checklist
- [ ] Multi-stage Dockerfile
- [ ] Build arguments cho env variables
- [ ] Standalone output optimization
- [ ] docker-compose cho local development
- [ ] Non-root user cho security

## Liên kết
- [Day 20: Testing Guide](./day-20.md) - Tiếp theo
