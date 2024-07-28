#!/bin/bash

# Carregar variáveis do arquivo .env
MONGODB_DATABASE=$(grep '^MONGODB_DATABASE' .env | cut -d '=' -f2)
MONGODB_USER=$(grep '^MONGODB_USER' .env | cut -d '=' -f2)
MONGODB_PASSWORD=$(grep '^MONGODB_PASSWORD' .env | cut -d '=' -f2)

# Verificar se as variáveis foram carregadas corretamente
if [ -z "$MONGODB_DATABASE" ] || [ -z "$MONGODB_USER" ] || [ -z "$MONGODB_PASSWORD" ]; then
  echo "Erro: Certifique-se de que o arquivo .env contém MONGODB_DATABASE, MONGODB_USER e MONGODB_PASSWORD"
  exit 1
fi

# Executar o contêiner MongoDB com as variáveis de ambiente carregadas
docker run -d \
  --name mongodb \
  --restart on-failure:3 \
  --network wpp-network \
  -e MONGO_INITDB_DATABASE=$MONGODB_DATABASE \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGODB_USER \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGODB_PASSWORD \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo:latest