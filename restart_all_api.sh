#!/bin/bash

#!/bin/bash

# Lista de contêineres
containers=("wppconnect-server-1" "wppconnect-server-2" "wppconnect-server-3" 
            "wppconnect-server-4" "wppconnect-server-5" "wppconnect-server-6"
            "wppconnect-server-7" "wppconnect-server-8" "wppconnect-server-9"
            "wppconnect-server-10" "wppconnect-server-11" "wppconnect-server-12"
            "wppconnect-server-hml")

# Loop através da lista de contêineres para parar e remover
for container in "${containers[@]}"; do
    docker stop "$container"
    docker rmi -f "$container"
done

# Limpar o sistema
docker system prune -f

# Reconstruir e iniciar os contêineres com Docker Compose
docker-compose up --build


# docker stop wppconnect-server-1
# docker rmi -f wppconnect-server-1
# docker stop wppconnect-server-2
# docker rmi -f wppconnect-server-2
# docker stop wppconnect-server-3
# docker rmi -f wppconnect-server-3
# docker stop wppconnect-server-4
# docker rmi -f wppconnect-server-4
# docker stop wppconnect-server-5
# docker rmi -f wppconnect-server-5
# docker stop wppconnect-server-6
# docker rmi -f wppconnect-server-6
# docker stop wppconnect-server-7
# docker rmi -f wppconnect-server-7
# docker stop wppconnect-server-8
# docker rmi -f wppconnect-server-8
# docker stop wppconnect-server-9
# docker rmi -f wppconnect-server-9
# docker stop wppconnect-server-10
# docker rmi -f wppconnect-server-10
# docker stop wppconnect-server-11
# docker rmi -f wppconnect-server-11
# docker stop wppconnect-server-12
# docker rmi -f wppconnect-server-12
# docker stop wppconnect-server-hml
# docker rmi -f wppconnect-server-hml

# docker system prune

# docker-compose up --build