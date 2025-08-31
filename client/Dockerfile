# Development-only Dockerfile for Vite React+TS with HMR
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* yarn.lock* ./
RUN npm ci || npm i

# Copy source
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Default command runs dev server (not a production build)
CMD ["npm", "run", "dev"]


