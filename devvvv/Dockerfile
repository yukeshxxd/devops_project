FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .     # ✅ Corrected line here

EXPOSE 3000

CMD ["node", "server.js"]
