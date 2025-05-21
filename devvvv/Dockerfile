FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .     # ✅ Correct: copy everything from current context

EXPOSE 3000

CMD ["node", "server.js"]
