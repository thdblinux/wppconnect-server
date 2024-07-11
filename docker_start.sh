#!/bin/sh

# Função para iniciar um contêiner
start_container() {
    container=$1
    echo "Starting container: $container"
    docker start "$container"
    if [ $? -eq 0 ]; then
        echo "Container $container started successfully."
    else
        echo "Failed to start container $container."
    fi
}

# Limpar o cache do Docker
docker builder prune -a -f

# Gerar a lista de contêineres dinamicamente, excluindo wppconnect-server-10 e wppconnect-server-11
containers=$(for i in $(seq 1 12); do [ "$i" -ne 10 ] && [ "$i" -ne 11 ] && echo "wppconnect-server-$i"; done)
containers="$containers wppconnect-server-hml"

# Iterar sobre a lista de contêineres e verificar o status
for container in $containers; do
    status=$(docker inspect --format '{{.State.Status}}' "$container" 2>/dev/null)

    if [ "$status" = "exited" ] || [ "$status" = "created" ]; then
        start_container "$container"
    else
        echo "Container $container is already running or not found."
    fi
done