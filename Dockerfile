FROM node:18-alpine

WORKDIR /app

# Copy package files for both root and client
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies
RUN npm ci

# Install client dependencies  
RUN cd client && npm ci

# Copy all source code
COPY . .

# Build the application (this runs both vite build and esbuild)
RUN npm run build

# Clean up dev dependencies
RUN npm prune --production
RUN cd client && npm prune --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
