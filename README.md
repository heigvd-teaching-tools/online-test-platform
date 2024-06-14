# Development

Instructions for setting up the development environment.

## Prerequisites

- Node.js V20.1.0
```
# If not already done make sure to use the correct node version.
# Either use Node Version Manager (nvm) or an alternative.
nvm use 20
```
- Docker
- Access to the eval related vault secrets

## Vault secrets

You can find the required secrets at the following location:

[eval vault secrets](https://vault.iict.ch/ui/vault/secrets/iict-eval/kv/list)

For development purposes only the Keycloak OIDC Client secret is allowed to be imported locally.


## 1) Clone the project

Prepare the project folder and clone the repository:

```bash
git clone git@github.com:heigvd-teaching-tools/online-test-platform.git
```

## 2) Environment variables

`/web/.env.local` file with the following variable:
```bash
NEXTAUTH_KEYCLOAK_CLIENT_SECRET=<secret-in-vault>
```
The file is ignored by git and must not be commited.

At the moment, the same Keycloak OIDC client is used in dev and prod.

## 3) Postgres database container

Having hardtime setting up the persisting volume for the postgres container in windows, i prepared a docker compose file that will create the database with the mounted volume.

```bash
cd /postgres
docker-compose up
```

Or you can use the following command to create the database with the mounted volume:

```bash
docker pull postgres
docker run -itd -e POSTGRES_USER=onlinetest -e POSTGRES_PASSWORD=onlinetest -p 5432:5432 -v data:/var/lib/postgresql/data --name postgresql postgres
```

## 4) Install the dependencies

```bash
cd /web
# Use `npm ci` to install package according to package-lock.json
# Only run `npm install` for updating node packages versions
npm ci
```

## 5) Run the migrations

Run the migrations to update the database schema. 

```bash
cd /web
npx prisma migrate dev
```

## 6) Run the application

Run the development server:

```bash
cd /web
npm run dev
```

Alternatively you can run the migrations and application in one-go:
```bash
cd /web
npm run dev:migration
```

The application will be available at `http://localhost:3000`. 

You can go and signin with your HEIG-VD account. When you make your first signin, the application will create your user in the database. Its default Role will be Student. 

You should see a screen "You are not authorized to access this page". 
Manually change the default role by connecting to the database and edit the user data in User table.

### 7) Add roles to your user

If you wish to start with an empty database you can manually add roles to your user. Otherwise please check the section "Get the database dump from the production server".

You may eventually need to adapt the container name `postgresql` and the database name `onlinetest` in the following command:

```bash
docker exec -it postgresql psql -U onlinetest -d onlinetest -c "UPDATE \"User\" SET roles = '{STUDENT,PROFESSOR,SUPER_ADMIN}' WHERE email = 'your.email@heig-vd.ch';" 
```

To confirm the record has been updated you should see the following output:

```bash
UPDATE 1
```

Refresh the page and you should see "You are not a member of any groups.". 

You can now create your own group and get started with the application.

### 7) Get the database dump from the production server (Preferred option) 

You can get the database dump from the production server and restore it in your local database. 

Connect on the production server. You will find helper scripts and a bunch of previous demps in the `~/db_dumps` folder. 

You have 2 scripts that can be used to backup and restore the database. pg_backup.sh and pg_restore.sh.

The copy of these scripts can be found in the `scripts` folder of the repository.

```bash
cd ~/db_dumps
bash pg_backup.sh
```

This will create a new backup file in the same folder. The naming pattern for the manually created dumps is `pg_manual_backup_date.sql`.

Download the file to your local machine and restore it in your local database.

If you are on windows, please use git bash to run the scripts. 

```bash
cd ~/your/local/db_dumps
bash pg_restore.sh <backup-file-name>
```

Run the migrations to update the database schema. If the current version of the schema is more recent than the one in production.

```bash
cd /web
npx prisma migrate dev
```


# Development Workflow


## Database Schema Migrations

*Important*: Do not use `npx prisma db push` to update the database schema. This will render the database schema out of sync with the migrations. 

Instead, use the following command:

```bash
# generate the migration
npx prisma migrate dev --name <migration-name> --create-only
```
This will generate a migration file in the `prisma/migrations` folder. 

Check the migration file to make sure that it is correct. It is generally not correct excepted when some minor changes are involved.

#### Useful Prisma Migration Commands

```bash

# (recommended) generate but do not apply the migration 
# Generally we must make sure that the auto-generated migration is correct before applying it.
npx prisma migrate dev --name <migration-name> --create-only

# (not recommended) generate the migration and apply it 
# Can be usefull for very small changes, but even in those cases i would recommend to check the migration before applying it. Keep in mind it must be applied on the production database.
npx prisma migrate dev --name <migration-name>


# list the migrations
npx prisma migrate status
```

# Deployment Using Gihub Actions

A self-hosted runner is used to deploy the application. The runner is configured on the organisation level and is available to all repositories:

https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

The runner is configured to run on the server `eval.iict-heig-vd.in`. Runner files can be found in the following location: `~/actions-runner`

## Deploy the application to production

Run the GitHub Actions deploy workflow.

The deploy workflow is setup to run on `workflow_dispatch` event. This means that it must be triggered manually from the GitHub Actions page: 

https://github.com/heigvd-teaching-tools/online-test-platform/actions

The workflow is setup to checkout the `main` branch and deploy it to the production server. Make sure that the `main` branch is up to date before triggering the workflow.


## Runner status 
If the runner is not running, you can start it manually using the following command:

```bash
# should run it in background so that it does not stop when you close the terminal
nohup ~/actions-runner/run.sh &
```
The logs of the runner can be checked using the following command:
    
```bash
cat nohup.out
```

Its status can be checked on the following page:
https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

## Setup a new runner

If you need to setup a new runner, please follow the instructions in the following link:
https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

Name of the runner: `deploy`
Add label: `deploy`

## GitHub Secrets

A number of secrets are required to deploy the application. These secrets are stored in the GitHub repository settings under the section `Secrets`.
https://github.com/heigvd-teaching-tools/online-test-platform/settings/secrets/actions

| Secret | Description |
| --- | --- |
| HEXTAUTH_KEYCLOAK_CLIENT_ID | The Keycloak OIDC client id |
| HEXTAUTH_KEYCLOAK_CLIENT_SECRET | The Keycloak OIDC client secret |
| NEXTAUTH_SECRET | The secret used to encrypt the session |
| POSTGRES_DB | The name of the database, used by docker compose to initialize the prod database |
| POSTGRES_PASSWORD | The password of the database user |
| POSTGRES_USER | The name of the database user |
| REMOTE_HOST | The IP address of the server used by the runner to deploy the application |
| REMOTE_SSH_KEY | The private key used by the runner to connect to the server |
| REMOTE_USER | The user used by the runner to connect to the server |
| SSL_FULLCHAIN | The fullchain certificate used by the server |
| SSL_PRIVKEY | The private key used by the server |

# Server configuration

- Must have a running docker daemon
- Open ports: 80, 443 and 22
- Must have rsync installed

# Database backup and restore

The deployment is creating a backup of the database before applying the migrations.

On the server under ~/db_dumps, you can find the latest backup of the database. The backups are named using the following pattern: `dump_onlinetest_2021-05-04_14-30-01.sql`. 

Here is how you can do it manually. 

The same folder contains 2 scripts that can be used to backup and restore the database. 

A new copy of these scripts can be found in the `scripts` folder of the repository.

## Backup the database

```bash
cd ~/db_dumps
bash pg_backup.sh
```
This will create a new backup file in the same folder.

## Restore the database

On the server under ~/db_dumps, you can find the latest backup of the database. The backups are named using the following pattern: `dump_onlinetest_2021-05-04_14-30-01.sql`. 

```bash
cd ~/db_dumps
bash pg_restore.sh <backup-file-name>
```

## Hints in case of issues with the scripts
- Line ending must be LF
- Execute permissions: `chmod +x pg_backup.sh`

## endpoint migrations done

## Monitoring Server Resources

A monitoring tool is available './home/heiguser/monitor.sh'. It refreshes every 5 seconds and displays the CPU, Memory and Disk usage of the server. The refresh rate can be changed in the script. 

```bash
cd ~
bash ./monitor.sh
```

### Disk space used by docker
    
```bash
docker system df
```


## Custom Docker Images in GitHub Container Registry for Code Check

#### Login
https://docs.github.com/fr/packages/working-with-a-github-packages-registry/working-with-the-container-registry

1) Login the GitHub user in docker cli using PAT (Personal Access Token)
```bash
docker login ghcr.io -u <username> --password <PAT>
```

#### Create Dockerfile

Example of a Dockerfile for a C++ image with CUnit installed

```bash
# Use an official GCC image from the Docker Hub
FROM gcc:latest

# Define the LABEL that provides metadata about the image
LABEL org.opencontainers.image.source="https://github.com/heigvd-teaching-tools/code-check-image"

# Install CUnit for unit testing
RUN apt-get update && apt-get install -y \
    libcunit1-dev \
    libcunit1
```

You do not need to copy files and compile the code in the Dockerfile. It will be done by the code check runner.

The important part is to do all the time consuming tasks such as installing dependencies in the Dockerfile.

#### Build and push the image

The Dockerfile must have the LABEL `org.opencontainers.image.source` set to the repository URL. This is required by GitHub to be able to build the image.


Build the image:
```bash
docker build -t ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest .

```

Push the image:
```bash
docker push ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest
```

#### Set the visibility of the package to public

The package must be public to be used in the code check runner.

Go to the package settings and set the package visibility to public.

https://github.com/orgs/heigvd-teaching-tools/packages?repo_name=online-test-platform

Select your package and go to the "package settings".

Goto Danger Zone / Change package visibility


#### Use the image in the code check 

Use `ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest` in the image field of the Code question.



# Server Scheduled Tasks

We need 2 scheduled tasks running on the server.

The database backup and the the docker disk space cleanup.

To list all existing cron jobs, use the following command:

```bash
crontab -l
```

To edit the cron jobs, use the following command:

```bash
crontab -e
```

## Cron jobs

```
0 3 * * * cd ~/crons/db_scheduled_backup && bash pg_backup.sh >> ~/crons/db_scheduled_backup/pg_backup.log 2>&1
0 0 * * 0 cd ~/crons && bash cleanup_disk_space.sh >> ~/crons/cleanup_disk_space.log 2>&1
```

Make sure each script writes its own log file for debugging purposes.

Add these 2 lines in crontab to schedule the tasks. Make sure the related scripts are in the correct folder.
You can copy these scripts from /scripts folder in the repository.

Update, save and exit the file to apply the changes.

- Go to the line you want to edit
- Press `i` to enter the insert mode
- Make the changes
- Press `ESC` to exit the insert mode
- Type `:wq` to save and exit the file

