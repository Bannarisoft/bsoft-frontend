# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@8.6.3 --activate

RUN pnpm install
RUN pnpm build:auto

EXPOSE 3000

CMD ["pnpm", "start"]
