#!/usr/bin/env bash

#################################
## Run application in DEV mode ##
#################################

started_at=$(date +"%s")

echo "-----> Provisioning containers"
docker compose --file docker-compose-dev.yaml up -d
echo ""

echo "-----> Waiting for server-dev to be ready..."
until docker compose --file docker-compose-dev.yaml exec -T server-dev true &>/dev/null; do
  printf "."
  sleep 2
done
echo ""
echo "Server-dev is ready!"


echo "-----> Running application migrations"
docker compose --file docker-compose-dev.yaml exec server-dev npx sequelize-cli db:migrate
echo ""

echo "-----> Running application seeds"
docker compose --file docker-compose-dev.yaml exec server-dev npx sequelize-cli db:seed:all
echo "<----- Seeds created"
echo ""

ended_at=$(date +"%s")
minutes=$(((ended_at - started_at) / 60))
seconds=$(((ended_at - started_at) % 60))

echo "-----> Done in ${minutes}m${seconds}s"

