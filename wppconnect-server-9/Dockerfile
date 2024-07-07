FROM node:lts-alpine3.18 as builder

ENV PORT=21479

RUN apk add wget && \
    apk add --no-cache git python3 make g++ \
    && yarn cache clean

RUN apk add vips-dev fftw-dev build-base

RUN yarn add sharp --ignore-engines

WORKDIR /home/node-09
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node-09/app 

WORKDIR /home/node-09/app

COPY ./config.ts /home/node-09/app/src

RUN npm install --unsafe-perm

FROM node:lts-alpine3.18
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /home/node-09/app
RUN apk add --no-cache chromium
COPY --from=builder /home/node-09/app/ .
EXPOSE 21479

