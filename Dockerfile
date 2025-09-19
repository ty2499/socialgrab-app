FROM node:18-alpine

# Install system dependencies for video processing
RUN apk add --no-cache python3 py3-pip ffmpeg

# Install yt-dlp using --break-system-packages flag
RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

# Copy everything first
COPY . .

# Install root dependencies
RUN npm install

# Install client dependencies
RUN cd client && npm install

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
