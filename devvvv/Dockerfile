# Use the official Node.js base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files inside current context
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run your Node.js app
CMD ["node", "server.js"]
