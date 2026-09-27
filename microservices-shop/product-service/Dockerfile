FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS builder
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY src ./src
USER node
EXPOSE 3001
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && exec node src/index.js"]
