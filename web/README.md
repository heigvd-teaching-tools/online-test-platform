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

Run interactive shell in the sandbox
    
```bash
    docker exec -it sandbox-docker /bin/sh
```

## API endpoints

### Code 
- /api/code/ [ANY]
- /api/code/test/answer/:questionId [ANY]
- /api/code/test/question/:questionId [ANY]

### Exam Sessions
- /api/exam-sessions/ 
    [
        GET - include questions, students, 
        POST - prepareTypeSpecific = (questionType, question)
    ]

- /api/exam-sessions/:examSessionId
    [
        GET - include students { user }, 
        PATCH - select phase, durationHours, durationMins
        DELETE - delete - 200 examSession
    ]

- /api/exam-sessions/:examSessionId/register
    [
        POST - use prepareTypeSpecific = (questionType, question)
    ]

- /api/exam-sessions/:examSessionId/questions/with-grading/official
    [
       GET - include typeSpecific with answer and grading
    ]

- /api/exam-sessions/:examSessionId/questions/with-answer/official
    [
       GET - include typeSpecific with answer
    ]

- /api/exam-sessions/:examSessionId/questions/:questionId/answer
    [
        POST - use prepareAnswer, grading 
    ]

### Exams 

- /api/exams 
    [
        GET - include questions 
        POST - label, description
    ]

- /api/exams/:examId
    [
        GET  
        PATCH - label, description, questions - use prepareTypeSpecific = (questionType, question)
        DELETE - delete - 200 exam
    ]

- /api/exams/:examId/questions
    [
        GET - include typeSpecific
        POST - create default question
    ]

### Grading 

- /api/grading
    [
        PATCH - { status, pointsObtained, signedByUserEmail, comment}, include signedBy
    ]

### Questions

- /api/questions
    [
        PATCH - include type_specific, use prepareTypeSpecific
        DELETE - 200 question
    ]

- /api/questions/order
    [
        PATCH - questions, ret message
    ]

### users 

- /api/users/:email/exam-sessions/:sessionId
    [
        GET - include questions, answers
    ]
    
  