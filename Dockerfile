# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV NODE_ENV=development

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip git && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies for video downloader
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip \
  && pip3 install -U yt-dlp \
  && rm -rf /var/lib/apt/lists/*

# Install only production node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts and runtime assets
COPY --from=builder /app/dist ./dist
COPY server/templates ./server/templates
COPY server/index.js ./server/index.js

# Create necessary directories and set permissions
RUN mkdir -p client/public/uploads temp_downloads \
  && chown -R node:node /app

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 5000

# Run the compiled JavaScript application
CMD ["node", "dist/index.js"]