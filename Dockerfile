FROM node:18-alpine

RUN apk update
RUN apk upgrade

RUN set -ex; apk add --no-cache --virtual .fetch-deps curl tar git;

WORKDIR /tmp/app

COPY package.json package.json

RUN npm install -g npm
# RUN npm install --production --no-audit
RUN npm i --production
RUN npm audit fix --production
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/node-gyp/test

COPY . .

EXPOSE 31000

ENV IMAGE_TAG=__image_tag__
ENV NODE_ENV='production'

RUN chmod -R 777 /tmp/app

CMD [ "node", "app.js" ]
