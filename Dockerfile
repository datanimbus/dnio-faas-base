FROM node:16-alpine

RUN apk update
RUN apk upgrade
RUN apk add git

WORKDIR /app

COPY package.json package.json

RUN npm install --production

COPY . .

EXPOSE 31000

CMD [ "node", "app.js" ]
