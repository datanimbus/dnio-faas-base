FROM node:16-alpine

RUN apk update && \
    apk upgrade && \
    apk add git

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .
