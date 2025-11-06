#!/usr/bin/env bash

#################################
## Run application in DEV mode ##
#################################

started_at=$(date +"%s")

echo "-----> Provisioning containers"
docker compose --file docker-compose-dev.yaml up -d
echo ""

echo "-----> Waiting for database to be ready..."
until docker compose --file docker-compose-dev.yaml exec db-dev pg_isready -U postgres -h localhost &>/dev/null; do
  printf "."
  sleep 5
done
echo ""
echo "Database is ready!"

echo "-----> Waiting for server-dev to be ready..."
until docker compose --file docker-compose-dev.yaml exec -T server-dev true &>/dev/null; do
  printf "."
  sleep 10
done
echo ""
echo "Server-dev is ready!"

echo "-----> Running application migrations"
docker compose --file docker-compose-dev.yaml exec server-dev npx sequelize-cli db:migrate
echo ""

echo "-----> Ensuring PostgreSQL enum includes 'moderator' role"
docker compose --file docker-compose-dev.yaml exec db-dev psql -U postgres -d squad-help-dev -c "
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Users_role') 
        AND enumlabel = 'moderator'
    ) THEN
        ALTER TYPE \"enum_Users_role\" ADD VALUE 'moderator';
        RAISE NOTICE 'Added moderator to enum_Users_role';
    ELSE
        RAISE NOTICE 'moderator already exists in enum_Users_role';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        RAISE NOTICE 'enum_Users_role does not exist yet, skipping...';
END
\$\$;"
echo ""

echo "-----> Running application seeds"
docker compose --file docker-compose-dev.yaml exec server-dev npx sequelize-cli db:seed:all
echo "<----- Seeds created"
echo ""

ended_at=$(date +"%s")
minutes=$(((ended_at - started_at) / 60))
seconds=$(((ended_at - started_at) % 60))

echo "-----> Done in ${minutes}m${seconds}s"