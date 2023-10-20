#!/bin/bash

# Variables declaration
DB_USER="onlinetest"
DB_NAME="onlinetest"

# Get the container ID for the database
CONTAINER_DB_ID=$(docker ps -qf "name=postgresql")

# Check if the SQL dump file is provided as an argument
if [[ -z "$1" ]]; then
    echo "Error: No SQL dump file provided."
    exit 1
fi

# Check if the SQL dump file exists and its size is greater than 0
if [[ ! -f "$1" ]] || [[ ! -s "$1" ]]; then
    echo "Error: The provided SQL dump file does not exist or its size is 0."
    exit 1
fi

DUMP_PATH_IN_CONTAINER="./tmp/dump.sql"

# Copy the dump to the container's /tmp directory
docker cp "$1" "${CONTAINER_DB_ID}:${DUMP_PATH_IN_CONTAINER}"

# Terminate all connections, drop the database, and recreate it
docker exec "${CONTAINER_DB_ID}" psql -U "${DB_USER}" -d postgres -c "SELECT pg_terminate_backend (pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}';"
docker exec "${CONTAINER_DB_ID}" dropdb -U "${DB_USER}" "${DB_NAME}"
docker exec "${CONTAINER_DB_ID}" createdb -U "${DB_USER}" "${DB_NAME}"

# Restore the database from the provided SQL dump
docker exec "${CONTAINER_DB_ID}" pg_restore -U "${DB_USER}" -d "${DB_NAME}" -F c "${DUMP_PATH_IN_CONTAINER}"

echo "Database restoration completed!"

# Cleaning up
docker exec "${CONTAINER_DB_ID}" rm "${DUMP_PATH_IN_CONTAINER}"
