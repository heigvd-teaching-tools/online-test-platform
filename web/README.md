# Getting Started

## Install the database with docker

Use docker compose in /postgres folder to create the database with the mounted volume.

or: 

```bash
docker pull postgres
docker run -itd -e POSTGRES_USER=onlinetest -e POSTGRES_PASSWORD=onlinetest -p 5432:5432 -v data:/var/lib/postgresql/data --name postgresql postgres
```

## Initialize the database with prisma

```bash
npx prisma db push
```

Eventually generate the prisma client:

```bash
npx prisma generate
```

## Configuring the environment

You must have a `.env` file with the following variables:

```bash
# development
DATABASE_URL="postgresql://onlinetest:onlinetest@localhost:5432/postgres?schema=public"
# NextAuthGitHub Provider
GITHUB_ID=
GITHUB_SECRET=
```

Consider checking the template `.env.sample` file.

#### Create a GitHub OAuth App
https://github.com/settings/developers.

Goto "OAuth Apps" and click "New OAuth App".

Once you create your app you can find the client ID and generate a new secret on the app page.

Use these values to fill `GITHUB_ID` and `GITHUB_SECRET` in your `.env` file.

`NEXTAUTH_SECRET` is only necessary for prod build.

You might also use a `.env.development.local` file to override the variables.

Nextjs will automatically load the variables from the .env file and override them with the `.env.development.local` file
if you run your app using the "dev" script.

Respectively, you can use `.env.production.local` files for the production environment.

## Run the application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

#### NextAuth with GitHub Provider

GitHub Client ID and Secret in `.env` (or in `.env.production.local`) are necessary for the GitHub Provider to work.

`NEXTAUTH_SECRET` necessary for prod build.

Generate using `openssl rand -base64 32`
