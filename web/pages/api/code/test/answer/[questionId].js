import { PrismaClient, Role } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../utils/auth';
import { runSandbox } from "../../../../../sandbox/runSandbox";
import { grading } from '../../../../../code/grading';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {
    // Student Code test runs concerns the student answer
    let isStudent = await hasRole(req, Role.STUDENT);
    let isProf = await hasRole(req, Role.PROFESSOR);

    if(!(isStudent || isProf)){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { questionId } = req.query;  

    const { user: { email } } = await getSession({ req });
    
    // solution code retrieved from the question
    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        include: {
            code: true
        }
    });

    const studentAnswer = await prisma.studentAnswer.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: email,
                questionId: questionId
            }
        },
        include: {
            code: true
        }
    });

    // student could run the test without having submitted an answer, run provided code
    let code = studentAnswer ? studentAnswer.code.code : question.code.code;

    await runSandbox(code, question.code.solution, "test").then(async (reponse) => {
        // grading when no answer -> test code run before any answer
        if(studentAnswer){
            // store the result in the student answer
            await prisma.StudentAnswerCode.update({
                where: {
                    userEmail_questionId: {
                        userEmail: email,
                        questionId: questionId
                    }
                },
                data: reponse
            }); 
        }

        // code question grading
        await prisma.studentQuestionGrading.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: email,
                    questionId: questionId
                }
            },
            update: grading(question, reponse),
            create: {
                userEmail: email,
                questionId: questionId,
                ...grading(question, reponse)
            }
        });

        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}