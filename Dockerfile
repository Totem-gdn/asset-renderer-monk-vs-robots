FROM node:lts-alpine
RUN  apt update && apt install imagemagick build-essential \
graphicsmagick -y
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/asset-generator

COPY . .

RUN npm ci

CMD ["node",  "index.js"]
