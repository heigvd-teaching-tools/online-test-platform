# Getting Started

## Install the database with docker

```bash
docker pull postgres
docker run -itd -e POSTGRES_USER=onlinetest -e POSTGRES_PASSWORD=onlinetest -p 5432:5432 -v data:/var/lib/postgresql/data --name postgresql postgres
```

## Initialize the database with prisma

```bash
npx prisma db push
```

```bash
npx prisma migrate dev
```

```bash
npx prisma generate
```

## Run the application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## NextAuth with GitHub Provider

GitHub Client ID and Secret in .env

`NEXTAUTH_SECRET` necessary for prod build

#### Prisma Studio

```bash
npx prisma studio
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

- /api/exam-sessions/ [GET, POST]

###### POST

Will create a new exam session and return the new exam session data.
It takes examId as a parameter. It will be used to recover all the questions of the exam.
The COPY of each question for the exam will be created for the exam session.

- /api/exam-sessions/:examSessionId
- /api/exam-sessions/:examSessionId/register
- /api/exam-sessions/:examSessionId/questions/with-grading/official
- /api/exam-sessions/:examSessionId/questions/with-answer/official
- /api/exam-sessions/:examSessionId/questions/:questionId/answer [PUT]

- /api/answer/:questionId [GET, PUT]
- /api/exam-sessions/:examSessionId/questions/:questionId/answer/code/:fileId [PUT]

###### PUT

Receives the student answer of the question and saves it in the database.

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
