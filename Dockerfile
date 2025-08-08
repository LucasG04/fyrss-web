# syntax=docker/dockerfile:1.7

# Build: DOCKER_BUILDKIT=1 docker build -t fyrss-web .
# Run:   docker run -p 4000:4000 fyrss-web

# --- Build stage ---
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NG_CLI_ANALYTICS=false

# Only copy package manifests (Dockerignore prevents extra files here)
COPY package*.json ./

# Persistent npm cache for faster installs
RUN --mount=type=cache,target=/root/.npm \
  npm ci --ignore-scripts --prefer-offline --no-audit --no-fund

# Copy all source files now and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
  PORT=4000

# Copy built artifacts from build stage
COPY --from=build /app/dist ./dist

# Run as non-root user
USER node

EXPOSE 4000

CMD ["node", "dist/fyrss-web/server/server.mjs"]
