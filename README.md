# EVAL

Eval is an educational platform designed to create and distribute training exercises and conduct exams across engineering and other disciplines. With a core focus on ease of use and simplicity, Eval ensures a seamless experience for educators and students.

Eval provides comprehensive insights into student engagement and understanding, enabling more effective assessments of student performance and comprehension.

Originally developed for HEIG-VD, EVAL is now available to the wider educational community, offering robust tools for creating and managing online evaluations.

## Questions

Eval sets itself apart with a specialized set of questions tailored for software engineering, offering unique capabilities.

Code Writing question enables students to write and execute code (JavaScript, Python, Java, C, C++, Golang, etc.) in a sand-boxed environment using an online editor powered by Monaco, similar to Visual Studio Code. This feature allows students to test their code meets the expected output, providing a more interactive and engaging experience.

Eval is also committed to expanding its offerings by tailoring question types adapted for a wide range of educational fields in science and beyond.

- True/False: Simple binary questions.
- Multiple Choice: Questions with multiple possible answers.
- Essay: Open-ended questions for detailed responses.
- Web: Questions related to CSS, HTML, and JavaScript.
- Code Reading: Understand the code and predict its output.
- Code Writing: Complete the code, run code checks, and test the output.
- Database: PostgreSQL-focused questions to complete queries and obtain expected results.

## Evaluation Management

EVAL simplifies evaluation management through four distinct phases:

1. **Draft Phase**: Educators can create and customize evaluations by selecting a collection of questions, organizing their order, and assigning point values. Students register using an evaluation link, with optional access restrictions.

2. **In Progress Phase**: Educators monitor registered students and their progress in real-time, allowing or prohibiting access to the evaluation and gaining insights from the analytics page.

3. **Grading Phase**: EVAL streamlines grading with automation, allowing educators to review, adjust grades, provide comments, and sign off. Annotations can be added for specific question types, and overall results are visible as grading progresses.

4. **Finished Phase**: Students receive their grades and feedback, while educators have access to comprehensive results, with options to update grades and download reports in CSV and PDF formats.

## Tech Stack
Frontend: Next.js 14
Backend: Prisma ORM
Database: PostgreSQL