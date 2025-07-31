FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package manager files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy rest of the app
COPY . .

# Build (optional)
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:auto"]
