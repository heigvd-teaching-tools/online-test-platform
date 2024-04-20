# Question Model Changed Checklist

## Description

This checklist is used to make sure all the dependencies of the question model are updated when the question model is changed.

## Checklist

### Models and Schema Changes
- [ ] Related models are updated in the prisma schema
- [ ] Migration script has been generated (--create-only)
- [ ] Migration script are updated to be production ready keeping in mind the data migration
- [ ] Migration script has been tested locally

### API Changes
- [ ] Prisma queries are updated to reflect the new schema
- [ ] Prisma Query include helper function `questionIncludeClause` in `./code/questions.js` is updated to reflect the new schema
- [ ] Prisma Query type specific helper function `questionTypeSpecific` in `./code/questions.js` are updated to reflect the new schema
- [ ] Prisma Query copy question helper function `copyQuestion` in `./code/questions.js` are updated to reflect the new schema
- [ ] Prisma Query create / update question helper function `codeInitialUpdateQuery` in `./code/questions.js` are updated to reflect the new schema

The changes in the question model structure would most likely involve changes in the api routes structure. 
These routes mostly rely on the above mentioned helper functions to interact with the question model.
Here is the list of api routes that depend on the question model:

#### Question Management endpoints
- [ ] `GET /api/questions` - Get all questions
- [ ] `POST /api/questions` - Create a new question
- [ ] `GET /api/questions/tags` - Get all tags for questions
- [ ] `GET /api/questions/[questionId]` - Get a question by id
- [ ] `PUT /api/questions/[questionId]/copy` - Copy a question
- [ ] `*` /api/questions/[questionId]/tags` - Manage tags for a question
- [ ] `*` /api/questions/[questionId]/code/*` - Manage Code question 
- [ ] `*` /api/questions/[questionId]/database/*` - Manage Database question
- [ ] `*` /api/questions/[questionId]/multiple-choice/*` - Manage Multiple Choice question

#### Sandbox Runner endpoints

##### Code and database Question management sandbox
- [ ] `*` /api/sandbox/[questionId]/code-writing/[nature]` - Code Question Management Sandox Runner
- [ ] `*` /api/sandbox/[questionId]/database` - Database Question Management Sandox Runner

##### Code and database Question student answer sandbox
- [ ] `*` /api/sandbox/evaluation/[evaluationId]/questions/[questionId]/student/code/code-writing` - Student run sandbox for code question
- [ ] `*` /api/sandbox/evaluation/[evaluationId]/questions/[questionId]/student/database/ - Student run sandbox for database question
- [ ] `*` /api/sandbox/evaluation/[evaluationId]/questions/[questionId]/student/database/console` - Student run database console sandbox


#### Collection endpoints

The collection compose of questions, is mainly dependent of the first level attribute of the Question model such as title, type etc..

- [ ] `*` /api/collections/[collectionId]/questions` - Managing questions in a collection, add, ordering, points etc..

#### Evaluation endpoints

When an evaluation is created, all the questions part of the collection are being copied to the evaluation. This uses the copyQuestion helper function.

- [ ] `*` /api/evaluations` - Create an evaluation and copy all questions from a collection
- [ ] `GET` /api/evaluations/[evaluationId]/questions` - Get all the questions of an evaluation - used in grading, finished and analytics. 
- [ ] `GET` /api/evaluations/[evaluationId]/consult/[userEmail]` - Professor consult student answers
- [ ] `GET` /api/evaluations/[evaluationId]/export` - Export evaluation answers in pdf

#### Student endpoints

The question model structure changes will probaly involve updates in the student answer models and the student endpoints.

- [ ] `*` /api/users/evaluations/[evaluationId]/join` - Student joins the evaluation, this endpoint will create enpty student answer for all the questions part of the evaluation
- [ ] `GET` /api/users/evaluations/[evaluationId]/take` - Student take the evaluation, this endpoint returns all the evaluation questions with the student answers.

- [ ] `*` /api/users/evaluations/[evaluationId]/questions/[questionId]/answer/*` - Various endpoints to manage student answers for various question types 
- [ ] `*` /api/users/evaluations/[evaluationId]/consult` - Student consult his answers when the evaluation is finished

### Frontend Changes

- [ ] Queestion List and componnents - `./components/questions/*`
- [ ] Question Management and components - `./components/question/*`
- [ ] Student related evaluation pages and components - `./components/users/evaluations/*`
- [ ] Professor related evaluation pages and components - `./components/evaluations/*`
    - [ ] Evaluation draft page - `./components/evaluations/pages/pageDraft.js`
    - [ ] Evaluation in progress page - `./components/evaluations/pages/pageInProgress.js`
    - [ ] Evaluation grading page - `./components/evaluations/pages/pageGrading.js`
    - [ ] Evaluation finished page - `./components/evaluations/pages/pageFinished.js`
    - [ ] Evaluation analytics page - `./components/evaluations/pages/pageFinished.js`
    - [ ] Evaluation export page (excel and pdf) - `./components/evaluations/pages/pageFinished.js`







