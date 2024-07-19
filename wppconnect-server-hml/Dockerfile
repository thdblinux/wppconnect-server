# Use a imagem node:lts-alpine3.20 como estágio de construção
FROM node:lts-alpine3.20 AS builder

# Instalação de pacotes necessários
RUN apk add --no-cache wget git python3 make g++ vips-dev fftw-dev build-base && \
    yarn cache clean && \
    yarn config set strict-ssl false && \
    yarn add sharp --ignore-engines

# Configuração do diretório de trabalho e clone do repositório da aplicação
WORKDIR /home/node-hml/app
ARG GIT_USER=thadeu_guimaraes
ARG GIT_TOKEN=g
RUN git clone https://${GIT_USER}:${GIT_TOKEN}@gitlab.com/marciothadeu1984/econnect.git .

# Copia o arquivo de configuração
COPY ./config.ts ./src

# Instalação das dependências npm com permissões inseguras
RUN npm install --unsafe-perm

# Início de um novo estágio usando node:lts-alpine3.20 como base
FROM node:lts-alpine3.20

# Define a variável de ambiente para pular o download do Chromium para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Define o diretório de trabalho
WORKDIR /home/node-hml/app

# Instalação do Chromium
RUN apk add --no-cache chromium

# Copia a aplicação construída do estágio 'builder'
COPY --from=builder /home/node-hml/app/ .