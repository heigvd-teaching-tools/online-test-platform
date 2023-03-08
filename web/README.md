## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## NextAuth with GitHub Provider

GitHub Client ID and Secret in .env

`NEXTAUTH_SECRET` necessary for prod build

## Prisma

```bash
npx prisma migrate dev
```
```bash
npx prisma generate
```
```bash
npx prisma db push
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

## API endpoints

### Code 
- /api/code/ [ANY]
- /api/code/test/answer/:questionId [ANY]
- /api/code/test/question/:questionId [ANY]

### Exam Sessions
- /api/exam-sessions/
- /api/exam-sessions/:examSessionId
- /api/exam-sessions/:examSessionId/register
- /api/exam-sessions/:examSessionId/questions/with-grading/official
- /api/exam-sessions/:examSessionId/questions/with-answer/official
- /api/exam-sessions/:examSessionId/questions/:questionId/answer
- 
### Exams 

- /api/exams 
- /api/exams/:examId
- /api/exams/:examId/questions

### Grading 

- /api/grading

### Questions

- /api/questions
- /api/questions/order
- /api/questions/:questionId/code [PUT, POST, GET]
- /api/questions/:questionId/code/sandbox [PUT, POST, GET]
- /api/questions/:questionId/code/tests [POST, GET]
- /api/questions/:questionId/code/tests/:index [PUT, DELETE]
- /api/questions/:questionId/code/files/:nature [POST, GET]
- /api/questions/:questionId/code/files/:nature/:fileId [PUT, DELETE]
- /api/questions/:questionId/code/files/:nature/pull [POST]





### users 

- /api/users/:email/exam-sessions/:sessionId 
