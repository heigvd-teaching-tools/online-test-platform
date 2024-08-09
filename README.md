# EVAL

Eval is an educational platform designed to create and distribute training exercises and conduct exams across engineering and other disciplines. With a core focus on ease of use and simplicity, Eval ensures a seamless experience for educators and students.

Eval provides comprehensive insights into student engagement and understanding, enabling more effective assessments of student performance and comprehension.

Originally developed for HEIG-VD, EVAL is now available to the wider educational community, offering robust tools for creating and managing online evaluations.

## Features

### Questions

Eval sets itself apart with a specialized set of questions tailored for software engineering, offering unique capabilities.

Code Writing question enables students to write and execute code (JavaScript, Python, Java, C, C++, Golang, etc.) in a sand-boxed environment using an online editor powered by Monaco, similar to Visual Studio Code. This feature allows students to make sure their code meets the expected output, providing a more interactive and engaging experience.

Eval is also committed to expanding its offerings by tailoring question types adapted for a wide range of educational fields in science and beyond.

- **True/False**: Simple binary questions.
- **Multiple Choice**: Questions with multiple possible answers.
- **Essay**: Open-ended questions for detailed responses.
- **Web**: Questions related to CSS, HTML, and JavaScript.
- **Code Reading**: Understand the code and predict its output.
- **Code Writing**: Complete the code, run code checks, and test the output.
- **Database**: PostgreSQL-focused questions to complete queries and obtain expected results.

### Evaluation Management

EVAL simplifies evaluation management through four distinct phases:

1. **Draft Phase**: Educators can create and customize evaluations by selecting a collection of questions, organizing their order, and assigning point values. Students register using an evaluation link, with optional access restrictions.

2. **In Progress Phase**: Educators monitor registered students and their progress in real-time, allowing or prohibiting access to the evaluation and gaining insights from the analytics page.

3. **Grading Phase**: EVAL streamlines grading with automation, allowing educators to review, adjust grades, provide comments, and sign off. Annotations can be added for specific question types, and overall results are visible as grading progresses.

4. **Finished Phase**: Students receive their grades and feedback, while educators have access to comprehensive results, with options to update grades and download reports in CSV and PDF formats.

## Tech Stack
- Frontend: Next.js 14
- Backend: Prisma ORM
- Database: PostgreSQL

## Development Setup

The current implementation of EVAL uses Keycloak as the Identity Provider (IDP).

However, the platform is built on Next.js and uses NextAuth, making it easy to configure with other IDPs or with your existing IDP.

To configure a different IDP, refer to the NextAuth configuration in the file located at ./web/pages/api/auth/[...nextauth].js and consult the NextAuth documentation. [next-auth](https://next-auth.js.org/v3/getting-started/introduction)

### Prerequisites

- Node.js V20+
- Docker
- Docker Compose

### Dev Docker Composer

At `/dev` directory, you can find a `docker-compose.yml` file that will start the database and Keycloak server.

In this approach, your database and IDP will be running in docker while the next.js app will be running on your local machine.

```bash
cd dev
docker-compose up
```

### Keycloak Setup

- Create a new realm called `eval`.
- Create a new client called `eval-client` in the realm `eval`.
  - Client Type `OpenID Connect`.
  - Client Authentication: `On`
  - Root Url: `http://localhost:3000` (the url of your eval app on localhost)
- Create your first eval user in the realm `eval`.
  - Details
    - Username: `eval-user`
    - Email: `eval-user@eval.com` (email is mandatory as NextAuth uses email as uniq identifier)
    - First and Last name
  - Credentials
    - Set the password: `eval-user`
    - Temporary: `off`

### Eval Environment Variables

You will find the client secret in the client `eval-client` settings in Keycloak under the tab `Credentials`.

Create a `.env.local` file in the `web` directory with the following content.

```bash
# NextAuth secret, this is a random 32 bytes string encoded in base64 (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=<generate secret>

NEXTAUTH_KEYCLOAK_CLIENT_ID=eval-client
NEXTAUTH_KEYCLOAK_CLIENT_SECRET=<client secret>
NEXTAUTH_KEYCLOAK_ISSUER_BASE_URL=http://localhost:8080/realms/HEIG-VD
```

The existing `.env` might needs to be adjusted to reflect your database config. It currently corresponds to the one proposed in the /dev/docker-compose.yml file.

### Install the app dependencies

```bash
cd web
npm install
```

### Run the database migrations

Make sure your database container is running. Then, run the following command to apply the migrations.

```bash
cd web
npx prisma migrate dev
```

You shall see in the output: `Your database is now in sync with your schema.`

### Run the app in development mode

```bash
cd web
npm run dev
```

### Setup your super admin user

When you signin in eval for the first time, a user will be created. It will have the role STUDENT by default.

After the signin has been done, you should see the following message: `You are not authorized to view this page.`. 

#### Propote to PROFESSOR and SUPER_ADMIN

To promote your user to a super admin, you need to update the role in the database.

```bash
docker exec -it eval-dev-infra-dev-db-1 psql -U eval -d eval -c "UPDATE \"User\" SET roles = '{STUDENT,PROFESSOR,SUPER_ADMIN}' WHERE email = 'eval-user@eval.com';"
```

Depending on your config, you might need to adjust the container name, user email and sql credentials.

You should see the following output: `UPDATE 1`

### Create your first group

Now, you can refresh the page.

You will see the message has change to `You are not a member of any groups.` with the possibility to create a new group.

Fell free to create your first group and welcome to eval!