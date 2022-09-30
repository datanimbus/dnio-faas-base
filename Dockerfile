FROM node:16.17.1-alpine3.15

RUN apk update
RUN apk upgrade
RUN apk add git

WORKDIR /app

COPY package.json package.json

RUN npm install -g npm
RUN npm install --production
RUN npm audit fix
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/node-gyp/test

COPY . .

EXPOSE 31000

ENV IMAGE_TAG=__image_tag__
ENV NODE_ENV='production'

CMD [ "node", "app.js" ]
