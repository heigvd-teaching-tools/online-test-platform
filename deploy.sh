#!/bin/bash

# you must define following environement on the mahcine you run this scruipt on:
: '
export POSTGRES_USER=youruser
export POSTGRES_PASSWORD=yourpassword
export POSTGRES_DB=yourdatabase
export NEXTAUTH_SECRET=yoursecret
export NEXTAUTH_GITHUB_ID=yourgithubid
export NEXTAUTH_GITHUB_SECRET=yourgithubsecret
export REMOTE_USER=yourremoteuser
export REMOTE_HOST=yourremotehost
export GITHUB_ORG=yourgithuborg
export GITHUB_APP_ID=yourgithubappid
export GITHUB_APP_PRIVATE_KEY_PATH=yourgithubappprivatekeypath
export GITHUB_APP_INSTALLATION_ID=yourgithubappinstallationid
'

# Define remote deployment directory
REMOTE_DEPLOY_DIR="~/onlinetest"

# Rsync all files except those ignored by git to the server
echo "Syncing files to the server..."

ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DEPLOY_DIR"

rsync -avzr --delete --exclude-from=.gitignore . $REMOTE_USER@$REMOTE_HOST:$REMOTE_DEPLOY_DIR

echo ""
# SSH into the server, generate .env files, and run Docker Compose
ssh -i ~/.ssh/id_rsa $REMOTE_USER@$REMOTE_HOST << EOF
cd $REMOTE_DEPLOY_DIR/web

echo "Generating .env files on the server..."
cat <<- END > .env
DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB"
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
GITHUB_ORG=$GITHUB_ORG
GITHUB_APP_ID=$GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY_PATH=$GITHUB_APP_PRIVATE_KEY_PATH
GITHUB_APP_INSTALLATION_ID=$GITHUB_APP_INSTALLATION_ID
END

cat <<- END > .env.production
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_GITHUB_ID=$NEXTAUTH_GITHUB_ID
NEXTAUTH_GITHUB_SECRET=$NEXTAUTH_GITHUB_SECRET
NEXTAUTH_URL=http://eval.iict-heig-vd.in
END

echo "Running Docker Compose on the server..."
cd ..
docker compose down
docker compose up --build -d
EOF
