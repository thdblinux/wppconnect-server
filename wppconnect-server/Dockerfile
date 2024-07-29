FROM node:lts-alpine3.20 AS builder

RUN apk add wget && \
    apk add --no-cache git python3 make g++ \
    && yarn cache clean

RUN apk add vips-dev fftw-dev build-base

RUN yarn config set strict-ssl false

RUN yarn add sharp --ignore-engines

RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node/app 

WORKDIR /home/node/app

COPY ./config.ts /home/node/app/src
COPY ./server.js .

RUN npm install --unsafe-perm

FROM node:lts-alpine3.20
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN apk add --no-cache chromium bash curl
COPY --from=builder /home/node/app/ .