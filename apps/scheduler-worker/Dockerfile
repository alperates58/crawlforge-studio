FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

# Copy package sources
COPY packages/database ./packages/database
COPY apps/scheduler-worker ./apps/scheduler-worker

# Install dependencies and build
RUN npm install
RUN npm run build --workspace=@crawlforge/database
RUN npm run build --workspace=@crawlforge/scheduler-worker

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/scheduler-worker ./apps/scheduler-worker

CMD ["npm", "run", "start", "--workspace=@crawlforge/scheduler-worker"]
