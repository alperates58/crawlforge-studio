FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

COPY packages/database ./packages/database
COPY apps/recorder-worker ./apps/recorder-worker

RUN npm install
RUN npm run build --workspace=@crawlforge/database

FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/recorder-worker ./apps/recorder-worker

# Install playwright browsers and dependencies
RUN npx playwright install --with-deps chromium

EXPOSE 3002

CMD ["npm", "run", "start", "--workspace=@crawlforge/recorder-worker"]
