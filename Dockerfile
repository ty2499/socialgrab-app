FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with --legacy-peer-deps to avoid conflicts
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build with specific NODE_ENV
RUN NODE_ENV=production npm run build

EXPOSE 5000

CMD ["npm", "start"]
