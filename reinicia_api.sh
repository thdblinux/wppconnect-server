#!/bin/bash

docker stop $1
docker rmi -f $1
docker builder prune -f

docker-compose up --build -d