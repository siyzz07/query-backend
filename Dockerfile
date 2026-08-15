# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm ci --legacy-peer-deps
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /usr/src/app/dist ./dist
# EXPOSE 7000
USER node
CMD ["node", "dist/index.js"]
