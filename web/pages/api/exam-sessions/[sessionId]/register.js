import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';

import { includeQuestions } from '../../../../code/questions';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma


const handler = async (req, res) => {
    
    let isProfOrStudent = await hasRole(req, Role.PROFESSOR) || await hasRole(req, Role.STUDENT);
    
    if(!isProfOrStudent) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    switch(req.method) {
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const post = async (req, res) => {
    const { sessionId } = req.query;
    const session = await getSession({ req });
    const studentEmail = session.user.email;

    const userOnExamSession = await prisma.userOnExamSession.upsert({
        where: {
            userEmail_examSessionId: {
                userEmail: studentEmail,
                examSessionId: sessionId
            }
        },
        update: {},
        create: {
            userEmail: studentEmail,
            examSessionId: sessionId
        }
    });

    let query = includeQuestions({
        parentResource: 'examSession',
        parentResourceId: sessionId,
        includeTypeSpecific: true
    });

    // add empty answers and gradings for each question
    const questions = await prisma.question.findMany(query);

    for (const question of questions) {   
        await prisma.studentAnswer.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: question.id
                }
            },
            update: {},
            create: {
                userEmail: studentEmail,
                questionId: question.id,
                [question.type]: {
                    // only code questions have type specific data, "partial code", in empty answer
                    create: question.type === QuestionType.code ? { 
                        code: question.code.code
                    } : {}
                },
                studentGrading: {
                    create: grading(question, undefined)
                }
            }
        });
    }
         
    res.status(200).json(userOnExamSession);
}


export default handler;