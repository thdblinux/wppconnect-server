#!/bin/bash

docker stop $1
docker rmi -f $1
docker system prune

cp /opt/docker/archives/$1.yaml /opt/docker/docker-compose.yaml

docker-compose up --build