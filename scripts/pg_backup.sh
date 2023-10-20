#!/bin/bash

# Variables declaration
DB_USER="onlinetest"
DB_NAME="onlinetest"
BACKUP_DIR="./"

# Get the container ID for the database
CONTAINER_DB_ID=$(docker ps -qf "name=onlinetest-db-")

# Check if container ID was found
if [[ -z "$CONTAINER_DB_ID" ]]; then
    echo "Error: No container found with name matching 'onlinetest-db-'."
    exit 1
fi

# Generate a timestamp for the backup filename
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILENAME="backup_${DB_NAME}_${TIMESTAMP}.sql"

# Generate a backup of the database
docker exec "${CONTAINER_DB_ID}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c > "${BACKUP_DIR}${BACKUP_FILENAME}"

# Check if the backup file was created and its size is greater than 0
if [[ ! -f "${BACKUP_DIR}${BACKUP_FILENAME}" ]] || [[ ! -s "${BACKUP_DIR}${BACKUP_FILENAME}" ]]; then
    echo "Error: Backup failed or resulted in an empty file."
    exit 1
fi

echo "Backup completed and saved to: ${BACKUP_DIR}${BACKUP_FILENAME}"
