#!/bin/bash
# Make the backup of the postgres 15 database volume from the remote server

# Variables for your setup
SSH_USER="$REMOTE_USER"
SSH_HOST="$REMOTE_HOST"
SSH_TARGET="$SSH_USER@$SSH_HOST"
POSTGRES_VOLUME_NAME="onlinetest_pgdata"
BACKUP_FOLDER="backups"
CURRENT_TIME=$(date "+%Y-%m-%d_%H-%M-%S")
BACKUP_FILE_NAME="pgdata_backup_$CURRENT_TIME.tar.gz"

# Ensure environment variables are set
if [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ]; then
    echo "Please ensure that all necessary environment variables are set. (REMOTE_USER, REMOTE_HOST)"
    exit 1
fi

# Connect to remote server and backup the PostgreSQL volume
echo "Backing up the PostgreSQL volume on the remote server..."

# Make sure the backups directory exists on the remote server
ssh $SSH_TARGET "mkdir -p ~/$BACKUP_FOLDER"

# Perform the backup
ssh $SSH_TARGET "docker run --rm -v $POSTGRES_VOLUME_NAME:/volume -v ~/$BACKUP_FOLDER:/backup alpine tar czf /backup/$BACKUP_FILE_NAME -C /volume ./"

# Fetch the backup archive from the remote server
echo "Fetching the backup archive from the remote server..."
scp $SSH_TARGET:~/$BACKUP_FOLDER/$BACKUP_FILE_NAME ./$BACKUP_FOLDER/

echo "Backup completed and stored at ./$BACKUP_FOLDER/$BACKUP_FILE_NAME"