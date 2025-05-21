# Use Node.js base image
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package files first for caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port (ensure server.js uses this port)
EXPOSE 3000

# Command to run your server
CMD ["node", "server.js"]
