#!/bin/bash

# Carregar a variável REDIS_PASSWORD do arquivo .env
REDIS_PASSWORD=$(grep '^REDIS_PASSWORD' .env | cut -d '=' -f2)

# Executar o contêiner Redis com a variável de ambiente carregada
docker run -d --name redis \
  --restart on-failure:3 \
  -e REDIS_PASSWORD=$REDIS_PASSWORD \
  -v redis_data:/data \
  --network wpp-network \
  redis redis-server --requirepass $REDIS_PASSWORD
