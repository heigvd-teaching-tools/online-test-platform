# Backup-RemotePgData.ps1
# ENDLINE MUST BE LF!!
# Make the backup of the postgres 15 database volume from the remote server

# Variables for your SSH setup
$sshUser = $env:REMOTE_USER
$sshHost = $env:REMOTE_HOST

# Check if necessary environment variables are set for SSH
if (!$sshUser -or !$sshHost) {
    Write-Host "Please ensure that all necessary environment variables are set for SSH. (REMOTE_USER, REMOTE_HOST)"
    exit 1
}

# Combine user and host into a connection string for ssh commands
$sshTarget = "{0}@{1}" -f $sshUser, $sshHost
$backFolder = "backups"

if (-not (Test-Path "./$backFolder")) {
    New-Item -ItemType Directory -Path "./$backFolder" -Force
}

# Generate a date-time string
$currentTime = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")

# Variables for backup process
$backupFilename = "pgdata_backup_$currentTime.tar.gz"
$backupLocalPath = "./$backFolder/$backupFilename"
$backupRemotePath = "~/$backFolder/$backupFilename"

# Backup the Docker volume on the remote server.
Write-Host "Backing up the PostgreSQL volume on the remote server..."

$backupCommand = @"
docker run --rm \
  --volume onlinetest_pgdata:/volume \
  --volume ~/${backFolder}:/backup \
  alpine \
  tar -czf /backup/$backupFilename -C /volume ./
"@

ssh $sshTarget $backupCommand

# Fetch the backup archive from the remote server to the local machine
Write-Host "Fetching the backup archive from the remote server..."

# Adjusting the SCP target to fetch the backup
$scpTargetForBackup = "{0}@{1}:$backupRemotePath" -f $sshUser, $sshHost
scp $scpTargetForBackup $backupLocalPath

Write-Host "Backup completed and stored at $backupLocalPath"
