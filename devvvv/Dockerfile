# Use the official Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000

# Command to run the application (adjust if your server uses a different file)
CMD ["node", "server.js"]
