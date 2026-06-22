FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

COPY packages/database ./packages/database
COPY apps/worker ./apps/worker

RUN npm install
RUN npm run build --workspace=@crawlforge/database
RUN npm run build --workspace=@crawlforge/worker

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/worker ./apps/worker

CMD ["npm", "run", "start", "--workspace=@crawlforge/worker"]
