# websocket/Dockerfile

FROM node:18

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Допустим, у нас index.js запускает WebSocket на порту 8080
EXPOSE 8080
CMD ["node", "index.js"]