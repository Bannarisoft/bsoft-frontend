FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy rest of the app
COPY . .

# Build
RUN pnpm run build:auto

# Production settings
ENV NODE_ENV=production
CMD ["pnpm", "run", "start:auto"]
