# Development

Instructions for setting up the development environment.

## Prerequisites

- Node.js V20.1.0
- Docker

## 1) Clone the project

Prepare the project folder and clone the repository:

```bash
cd /path/to/your/projects
git clone git@github.com:heigvd-teaching-tools/online-test-platform.git
```

## 2) Environement variables

`/web/.env` file with the following variables:

```bash
DATABASE_URL="postgresql://onlinetest:onlinetest@localhost:5432/onlinetest"

# used by the db and web service

POSTGRES_USER=onlinetest
POSTGRES_PASSWORD=onlinetest
POSTGRES_DB=onlinetest

```
`/web/.env.development` file with the following variables:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate a secret
HEXTAUTH_KEYCLOAK_CLIENT_ID=iict-eval
HEXTAUTH_KEYCLOAK_CLIENT_SECRET=your-secret
HEXTAUTH_KEYCLOAK_ISSUER_BASE_URL=https://idp.heig-vd.ch/realms/HEIG-VD
DB_SANDBOX_CLIENT_HOST=172.17.0.1
```

You may eventually set all variables in the `.env` file.

To generate a next auth secret, you can use the following command:

```bash
openssl rand -base64 32
```

No vault at this moment, the keycloak client secret can be found on production server in the `./web/.env.production` file.

We use the same keycloak realm in dev and prod. 


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
npm install
```

## 5) Initialize the database with prisma

Do not use `npx prisma db push` if your attention is to contribute to the project. This will render the database schema out of sync with the migrations. 

When clo

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

The application will be available at `http://localhost:3000`. 

You can go and signin with your keycloak account. When you make your first signin, the application will create your user in the database. Its default Role will be Student. 

You should see a screen "You are not authorized to access this page". 

### 7) Add roles to your user

If you wish to start with an empty database you can manually add roles to your user. 

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

### 7) Get the database dump from the production server (Prefered option) 

You can get the database dump from the production server and restore it in your local database. 

Connect on the production server. You will find helper scripts in the `~/db_dumps` folder. 

You will find 2 scripts that can be used to backup and restore the database.

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

Run the migrations to update the database schema.

```bash
cd /web
npx prisma migrate dev
```

























## Database Schema Migrations

*Important*: Do not use `npx prisma db push` to update the database schema. This will render the database schema out of sync with the migrations. 

Instead, use the following command:

```bash
# generate the migration
npx prisma migrate dev --name <migration-name>
```

This will generate a migration file in the `prisma/migrations` folder. 

These migrations will be applied on production database by the docker compose during the deploy workflow.

#### Useful Prisma Migration Commands

```bash
# generate the migration
npx prisma migrate dev --name <migration-name>

# generate but do not apply the migration
# this can be usefull when its necessary to create a migration but you want first to change the migration file before applying it
# For instance, when renaming a field prisma migration consider it to be a drop and create field. You can usee --create-only to avoid applying the migration and change the migration file to rename the field.
# You will still get the warning about the data loss but you can ignore it and say yes
npx prisma migrate dev --name <migration-name> --create-only

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
| `POSTGRES_USER` | The postgres user |
| `POSTGRES_PASSWORD` | The postgres password |
| `POSTGRES_DB` | The postgres database |
| ´GH_APP_ID´ | The github app id used to browse org members |
| `GH_APP_INSTALLATION_ID` | The github app installation id used to browse org members |
| `GH_APP_PRIVATE_KEY` | The github app private key used to browse org members |
| `NEXTAUTH_SECRET` | The nextauth secret |
| `NEXTAUTH_GITHUB_ID` | The nextauth github id |
| `NEXTAUTH_GITHUB_SECRET` | The nextauth github secret |

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

evaluation