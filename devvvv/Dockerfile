FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .        # ✅ THIS IS THE FIXED LINE

EXPOSE 3000

CMD ["node", "server.js"]
