FROM node:lts-alpine
RUN  apk update && apk add --no-cache imagemagick build-base graphicsmagick
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/asset-generator

COPY . .

RUN npm ci

CMD ["node",  "index.js"]
