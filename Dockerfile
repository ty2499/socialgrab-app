FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 py3-pip py3-venv ffmpeg

# Create virtual environment and install yt-dlp
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install yt-dlp

# Add virtual environment to PATH
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies
RUN npm install
RUN cd client && npm install

# Build the application
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
