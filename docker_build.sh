<<<<<<< HEAD
#!/bin/sh

# Função para construir e iniciar um contêiner
build_and_start_container() {
    container=$1
    echo "Building and starting container: $container"
    docker compose up -d --build "$container"
    if [ $? -eq 0 ]; then
        echo "Container $container built and started successfully."
    else
        echo "Failed to build and start container $container."
    fi
}

# Limpar o cache do Docker
docker builder prune -a -f

# Gerar a lista de contêineres dinamicamente
containers=$(for i in $(seq 1 12); do echo "wppconnect-server-$i"; done)
containers="$containers wppconnect-server-hml"

# Iterar sobre a lista de contêineres e verificar o status
for container in $containers; do
    status=$(docker inspect --format '{{.State.Status}}' "$container" 2>/dev/null)

    if [ "$status" = "exited" ] || [ "$status" = "created" ] || [ -z "$status" ]; then
        build_and_start_container "$container"
    elif [ "$status" = "running" ]; then
        echo "Container $container is already running."
    else
        echo "Container $container not found."
    fi
done
=======
#!/bin/bash

docker stop $1
docker rmi -f $1
docker system prune

docker-compose up --build -d
>>>>>>> main
