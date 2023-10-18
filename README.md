# Development

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
sh pg_backup.sh
```
This will create a new backup file in the same folder.

## Restore the database

On the server under ~/db_dumps, you can find the latest backup of the database. The backups are named using the following pattern: `dump_onlinetest_2021-05-04_14-30-01.sql`. 

```bash
cd ~/db_dumps
sh pg_restore.sh <backup-file-name>
```

