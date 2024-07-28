#!/bin/bash

docker stop $(docker ps -q)

docker system prune -a -f

docker-compose up --build -d