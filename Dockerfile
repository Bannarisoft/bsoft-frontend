FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build:auto

ENV NODE_ENV=production
CMD ["pnpm", "run", "start:auto"]
