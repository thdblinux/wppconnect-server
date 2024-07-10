#!/bin/sh

containers="
wppconnect-server-1
wppconnect-server-2
wppconnect-server-3
wppconnect-server-4
wppconnect-server-5
wppconnect-server-6
wppconnect-server-7
wppconnect-server-8
wppconnect-server-9
wppconnect-server-10
wppconnect-server-11
wppconnect-server-12
wppconnect-server-hml
"

for container in $containers; do
    status=$(docker inspect --format '{{.State.Status}}' "$container" 2>/dev/null)

    if [ "$status" = "exited" ] || [ "$status" = "created" ] || [ -z "$status" ]; then
        echo "Starting container: $container"
        docker start "$container" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "Container $container started successfully."
        else
            echo "Failed to start container $container."
        fi
    elif [ "$status" = "running" ]; then
        echo "Container $container is already running."
    else
        echo "Container $container not found."
    fi
done