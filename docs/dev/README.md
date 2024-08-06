# Development Environment Setup

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

### 7) Get the database dump from the production server

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

## Database Schema Migrations

*Important*: Do not use `npx prisma db push` to update the database schema. This will render the database schema out of sync with the migrations. 

Instead, use the following command:

```bash
# generate the migration
npx prisma migrate dev --name <migration-name> --create-only
```
This will generate a migration file in the `prisma/migrations` folder. 

Check the migration file to make sure that it is complete. It is generally not complete excepted when some minor changes are involved.

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