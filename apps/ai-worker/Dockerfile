FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

COPY packages/database ./packages/database
COPY apps/ai-worker ./apps/ai-worker

RUN npm install
RUN npm run build --workspace=@crawlforge/database
RUN npm run build --workspace=@crawlforge/ai-worker

FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/ai-worker ./apps/ai-worker

CMD ["npm", "run", "start", "--workspace=@crawlforge/ai-worker"]
