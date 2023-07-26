# Variables for your setup
$sshUser = $env:REMOTE_USER
$sshHost = $env:REMOTE_HOST

# Combine user and host into a connection string for ssh commands
$sshTarget = "{0}@{1}" -f $sshUser, $sshHost

# Combine user and host into a connection string for scp command
$scpTarget = "{0}@{1}:~/onlinetest/deploy.tar.gz" -f $sshUser, $sshHost

Write-Host $sshTarget
Write-Host $scpTarget

# Create an archive "deploy.tar.gz" excluding git ignored files
Write-Host "Creating an archive..."
git archive --format tar.gz --output deploy.tar.gz HEAD

# Create the directory on the remote server using ssh
Write-Host "Creating directory on the remote server..."
ssh $sshTarget "mkdir -p ~/onlinetest"

# Copy the archive to the remote server using ssh
Write-Host "Transferring archive to the remote server..."
scp deploy.tar.gz $scpTarget

# Unzip and remove the archive on the remote server
Write-Host "Setting up files on the remote server..."
ssh $sshTarget "tar -xzf ~/onlinetest/deploy.tar.gz -C ~/onlinetest && rm ~/onlinetest/deploy.tar.gz"


# SSH into the server and uncompress the archive, generate .env files, and run Docker Compose
Write-Host "Setting up files and running Docker Compose on the server..."
$sshCommand = @"
cd ~/onlinetest
echo "DATABASE_URL=postgresql://${env:POSTGRES_USER}:${env:POSTGRES_PASSWORD}@db:5432/${env:POSTGRES_DB}" > web/.env
echo 'POSTGRES_USER=$env:POSTGRES_USER' >> web/.env
echo 'POSTGRES_PASSWORD=$env:POSTGRES_PASSWORD' >> web/.env
echo 'POSTGRES_DB=$env:POSTGRES_DB' >> web/.env
echo 'NEXTAUTH_SECRET=$env:NEXTAUTH_SECRET' > web/.env.production
echo 'NEXTAUTH_GITHUB_ID=$env:NEXTAUTH_GITHUB_ID' >> web/.env.production
echo 'NEXTAUTH_GITHUB_SECRET=$env:NEXTAUTH_GITHUB_SECRET' >> web/.env.production
echo 'NEXTAUTH_URL=http://eval.iict-heig-vd.in' >> web/.env.production
docker compose down
docker compose up --build -d
"@

ssh $sshTarget $sshCommand
