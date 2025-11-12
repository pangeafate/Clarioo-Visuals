# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and change ownership
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and change ownership
COPY . .

# Expose port
EXPOSE 8080

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
