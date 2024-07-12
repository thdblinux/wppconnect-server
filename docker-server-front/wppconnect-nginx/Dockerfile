FROM nginx:1.15.0-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./certs /etc/nginx/ssl
COPY nginx.conf /etc/nginx/conf.d