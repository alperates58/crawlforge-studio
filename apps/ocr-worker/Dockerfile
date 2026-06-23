FROM node:20-alpine

# Install OS-level dependencies for building and OCR (though tesseract.js uses pure JS/WASM by default, standard libs are safe)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root configurations
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy the specific workspaces needed
COPY packages/database ./packages/database
COPY apps/ocr-worker ./apps/ocr-worker

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build ocr-worker
RUN cd apps/ocr-worker && npm run build

# Start
CMD ["node", "apps/ocr-worker/dist/index.js"]
