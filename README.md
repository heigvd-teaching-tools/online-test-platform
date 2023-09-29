# Deployment

The server is accessible only when using vpn (vpn.heig-vd.ch). Thus, no github action is used for automated deployment.

The project contains 2 deployment scripts:
- `deploy.sh` - to be used on linux or macos
- `deploy.ps1` - to be used on windows

The scripts will:
- use git archive to create a zip file of the project
- copy the zip file to the server using scp
- unzip the archive on the server
- create the production .env files necessary for the application to run
- build the custom docker images ./docker-images)
    - custom-sqlfluff : used to run sqlfluff sandbox to lint database question queries
- run docker-compose up with build option in detached mode

## Usage

Each script is dependant on the following environment variables. These variables must be set before running the script.

| Variable | Value |  Description                                                                                                                                                     |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REMOTE_USER`                  | `heiguser`                      | The user to use to connect to the server                                                                                                                       |
| `REMOTE_HOST`                  | `eval.iict-heig-vd.in`          | The host to connect to                                                                                                                                         |
| `POSTGRES_USER`                | `onlinetest`                    | The postgres user to use by the application                                                                                                                    |
| `POSTGRES_PASSWORD`            | `onlinetest`                    | The postgres password to use by the application                                                                                                                |
| `POSTGRES_DB`                  | `onlinetest`                    | The postgres database to use by the application                                                                                                                |
| `NEXTAUTH_URL`                 | `https://eval.iict-heig-vd.in`  | The url of the application to be used by next-auth                                                                                                             |
| `NEXTAUTH_SECRET`              | `...`                           | The secret to use by next-auth                                                                                                                                 |
| `NEXTAUTH_GITHUB_ID`           | `...`                           | The github id to use by next-auth, check the oauth app in the organisation settings                                                                             |
| `NEXTAUTH_GITHUB_SECRET`       | `...`                           | The github secret to use by next-auth, check the oauth app in the organisation settings                                                                        |
| `NEXTAUTH_GITHUB_ORG`          | `heigvd-teaching-tools`         | The app is used to determine if the user is a professor -> all members of the organisation are considered as professors                                         |
| `GITHUB_APP_ID`                | `383691`                        | The github app id to use by next-auth, check the github app in the organisation settings                                                                       |
| `GITHUB_APP_PRIVATE_KEY_PATH`  | `eval-teaching-tools.private-key.pem` | The github app private key                                                                                                                                       |
| `GITHUB_APP_INSTALLATION_ID`   | `41302676`                      | The github app installation id, can be found in the organisation in installed apps                                                                              |
| `DB_SANDBOX_CLIENT_HOST`       | `172.17.0.1`                    | Used by the database postgres client to connect to the database sandbox in a sibling container                                                                  |



Oauth App "heigvd-teaching-tools"/"settings":
https://github.com/organizations/heigvd-teaching-tools/settings/applications/2307660

GitHub App "heigvd-teaching-tools"/"settings"/"apps":
https://github.com/organizations/heigvd-teaching-tools/settings/apps/eval-teaching-tools

#### Environement variables for powershell

```powershell
$env:POSTGRES_USER="onlinetest"
$env:POSTGRES_PASSWORD="onlinetest"
$env:POSTGRES_DB="onlinetest"
$env:NEXTAUTH_URL="https://eval.iict-heig-vd.in"
$env:NEXTAUTH_SECRET="..."
$env:NEXTAUTH_GITHUB_ID="..."
$env:NEXTAUTH_GITHUB_SECRET="..."
$env:REMOTE_USER="heiguser"
$env:REMOTE_HOST="eval.iict-heig-vd.in"
$env:GITHUB_ORG="heigvd-teaching-tools"
$env:GITHUB_APP_ID=383691
$env:GITHUB_APP_PRIVATE_KEY_PATH="eval-teaching-tools.private-key.pem"
$env:GITHUB_APP_INSTALLATION_ID=41302676
$env:DB_SANDBOX_CLIENT_HOST="172.17.0.1"
```

#### Environement variables for bash

```bash
export POSTGRES_USER=onlinetest
export POSTGRES_PASSWORD=onlinetest
export POSTGRES_DB=onlinetest
export NEXTAUTH_URL=https://eval.iict-heig-vd.in
export NEXTAUTH_SECRET=...
export NEXTAUTH_GITHUB_ID=...
export NEXTAUTH_GITHUB_SECRET=...
export REMOTE_USER=heiguser
export REMOTE_HOST=eval.iict-heig-vd.in
export GITHUB_ORG=heigvd-teaching-tools
export GITHUB_APP_ID=383691
export GITHUB_APP_PRIVATE_KEY_PATH=eval-teaching-tools.private-key.pem
export GITHUB_APP_INSTALLATION_ID=41302676
export DB_SANDBOX_CLIENT_HOST=172.17.0.1
```

#### Run the script

```bash
./deploy.sh
```

```powershell
.\deploy.ps1
```


## Server configuration

- Must have a running docker daemon
- Open ports: 80, 443 and 22

## First time deployment - Manual steps

Some manual steps are necessary for the first time deployment. This can be done either before or after running the deployment script. The nginx container will fail to start if these steps are done after the deployment script. So consider starting the nginx container manually after these steps.

A copy of the sll certificates and the GitHub App private key are stored in the server at the following location: `~/backups`

Manual steps to be done on the server:
- Copy the ssl certificates to the project folder under : `~/onlinetest/ssl/`
- Copy the github app private key to the project folder under : `~/onlinetest/eval-teaching-tools.private-key.pem`

#### Copy SSL certificates

 Use the existing copy in the server at the following location: `~/backups/ssl/`. or contact system admin to get a new copy.

#### Copy github app private key

A copy of the key is stored in the server at the following location: `~/backups/eval-teaching-tools.private-key.pem`. Or generate a new private key for the github app. This can be done in the github app settings.


# Backup

The project has 2 utility scripts to backup the database volume:
- `./backup_pgdata.sh` - to be used on linux or macos
- `./backup_pgdata.ps1` - to be used on windows

These scripts use ssh to connect to the server and use docker to create a backup of the database volume. The backup is stored in the server at the following location: `~/backups/pgdata_backup_$(date +%Y-%m-%d_%H-%M-%S).tar.gz`

The backup file will then be downloaded to the local machine at the following location: `./backups/pgdata_backup_$(date +%Y-%m-%d_%H-%M-%S).tar.gz`

## Usage

The scripts are dependant on the following environment variables. These variables must be set before running the script.

| Variable | Value | Description |
| --- | --- |
| `REMOTE_USER` | `heiguser` | The user to use to connect to the server |
| `REMOTE_HOST` | `eval.iict-heig-vd.in` | The host to connect to |


#### Environement variables for powershell

```powershell
$env:REMOTE_USER="heiguser"
$env:REMOTE_HOST="eval.iict-heig-vd.in"
```

#### Environement variables for bash

```bash
export REMOTE_USER=heiguser
export REMOTE_HOST=eval.iict-heig-vd.in
```

#### Run the script

```bash
./backup_pgdata.sh
```

```powershell
.\backup_pgdata.ps1
```
