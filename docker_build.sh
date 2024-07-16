#!/bin/bash

docker stop $1
docker rmi -f $1
docker system prune

docker-compose up --build -d