FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# ── development ───────────────────────────────────────────────────────────────
FROM base AS development
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# ── install all deps ──────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json .
RUN npm ci

# ── build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
ENV NODE_ENV=production
COPY package*.json .
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ── production ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
