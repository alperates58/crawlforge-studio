FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY apps/web ./apps/web

RUN npm install
RUN npm run build --workspace=@crawlforge/web

FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
