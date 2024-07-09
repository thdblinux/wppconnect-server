FROM node:lts-alpine3.18 AS builder

RUN apk add wget && \
    apk add --no-cache git python3 make g++ \
    && yarn cache clean

RUN apk add vips-dev fftw-dev build-base

RUN yarn add sharp --ignore-engines

WORKDIR /home/node-hml
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node-hml/app 

WORKDIR /home/node-hml/app

COPY ./config.ts /home/node-hml/app/src

RUN npm install --unsafe-perm

FROM node:lts-alpine3.18
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /home/node-hml/app
RUN apk add --no-cache chromium
COPY --from=builder /home/node-hml/app/ .