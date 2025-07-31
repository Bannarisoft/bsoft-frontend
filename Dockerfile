# Dockerfile

# Use the official Next.js image or Node base
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy production env file
COPY .env.production .env.production

# Build the app with production env
ENV NODE_ENV=production
RUN npm run build

# Use lighter image for serving
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.production ./.env.production

EXPOSE 3000

CMD ["npm", "start"]
