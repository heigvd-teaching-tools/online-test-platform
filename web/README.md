## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## NextAuth with GitHub Provider

GitHub Client ID and Secret in .env

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

#### Prisma Studio

```bash
npx prisma studio
```

## Postgres

```bash
docker pull postgres
docker run -itd -e POSTGRES_USER=onlinetest -e POSTGRES_PASSWORD=onlinetest -p 5432:5432 -v /data:/var/lib/postgresql/data --name postgresql postgres
```

Database URL in .env

## Monaco Code Editor
https://www.npmjs.com/package/@monaco-editor/react

## Sandbox

Run the docker sandbox dind ("Docker in Docker")
    
```bash
    docker run --privileged --name sandbox-docker docker:dind
```

Copy sandbox environement docker files to the sandbox docker
```bash
    docker cp ./sandbox sandbox-docker:/
```
