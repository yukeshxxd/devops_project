FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy all files inside current build context (devvvv folder contents) to /usr/src/app
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
