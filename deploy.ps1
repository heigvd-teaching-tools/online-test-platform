# Variables for your setup
$sshUser = $env:REMOTE_USER
$sshHost = $env:REMOTE_HOST
$postgresUser = $env:POSTGRES_USER
$postgresPassword = $env:POSTGRES_PASSWORD
$postgresDb = $env:POSTGRES_DB
$nextAuthSecret = $env:NEXTAUTH_SECRET
$nextAuthGithubId = $env:NEXTAUTH_GITHUB_ID
$nextAuthGithubSecret = $env:NEXTAUTH_GITHUB_SECRET

# Check if necessary environment variables are set
if (!$sshUser -or !$sshHost -or !$postgresUser -or !$postgresPassword -or !$postgresDb -or !$nextAuthSecret -or !$nextAuthGithubId -or !$nextAuthGithubSecret) {
    Write-Host "Please ensure that all necessary environment variables are set. (REMOTE_USER, REMOTE_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, NEXTAUTH_SECRET, NEXTAUTH_GITHUB_ID, NEXTAUTH_GITHUB_SECRET)"
    exit 1
}

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
echo "DATABASE_URL=postgresql://${postgresUser}:${postgresPassword}@db:5432/${postgresDb}" > web/.env
echo 'POSTGRES_USER=${postgresUser}' >> web/.env
echo 'POSTGRES_PASSWORD=${postgresPassword}' >> web/.env
echo 'POSTGRES_DB=${postgresDb}' >> web/.env
echo 'NEXTAUTH_SECRET=${nextAuthSecret}' > web/.env.production
echo 'NEXTAUTH_GITHUB_ID=${nextAuthGithubId}' >> web/.env.production
echo 'NEXTAUTH_GITHUB_SECRET=${nextAuthGithubSecret}' >> web/.env.production
echo 'NEXTAUTH_URL=http://eval.iict-heig-vd.in' >> web/.env.production
docker compose down
docker compose up --build -d
"@

ssh $sshTarget $sshCommand