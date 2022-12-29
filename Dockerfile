FROM node:lts-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/asset-generator

COPY . .

RUN npm ci

CMD ["node",  "index.js"]
