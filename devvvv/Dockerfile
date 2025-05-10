# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire app source code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
