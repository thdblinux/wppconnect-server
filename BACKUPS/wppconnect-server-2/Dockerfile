FROM node:lts-alpine3.18 as builder

ENV PORT=21466

RUN apk add wget && \
    apk add --no-cache git

WORKDIR /home/node-02
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node-02/app 

WORKDIR /home/node-02/app

COPY ./config.ts /home/node-02/app/src

RUN yarn install

FROM node:lts-alpine3.18
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /home/node-02/app
RUN apk add chromium
COPY --from=builder /home/node-02/app/ .
EXPOSE 21466

