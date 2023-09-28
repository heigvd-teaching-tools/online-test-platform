#!/bin/bash

# Variables for your setup
SSH_USER="$REMOTE_USER"
SSH_HOST="$REMOTE_HOST"
SSH_TARGET="$SSH_USER@$SSH_HOST"
POSTGRES_VOLUME_NAME="onlinetest_pgdata"
BACKUP_FILE_NAME="pgdata_backup.tar.gz"

# Ensure environment variables are set
if [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ]; then
    echo "Please ensure that all necessary environment variables are set. (REMOTE_USER, REMOTE_HOST)"
    exit 1
fi

# Connect to remote server and backup the PostgreSQL volume
echo "Backing up the PostgreSQL volume on the remote server..."
ssh $SSH_TARGET "docker run --rm -v $POSTGRES_VOLUME_NAME:/volume -v ~/:/backup alpine tar czf /backup/$BACKUP_FILE_NAME.tar.gz -C /volume ./"

# Fetch the backup archive from the remote server
echo "Fetching the backup archive from the remote server..."
scp $SSH_TARGET:~/$BACKUP_FILE_NAME ./

echo "Backup completed and stored at ./$BACKUP_FILE_NAME"

