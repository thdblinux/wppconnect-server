FROM node:lts-alpine3.16

WORKDIR /home/node/app
COPY ./app .

RUN apk add chromium && \
	npm install

EXPOSE 21465
