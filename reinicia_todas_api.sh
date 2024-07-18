#!/bin/bash

docker stop $(docker ps -q)

docker system prune -f

docker-compose up --build -d