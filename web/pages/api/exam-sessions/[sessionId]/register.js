import { PrismaClient, Role } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';

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
   
    const userOnExamSession = await prisma.userOnExamSession.upsert(
        {
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
        }

    );

    // add grading for each question
    const questions = await prisma.question.findMany({
        where: {
            examSessionId: sessionId
        }
    });

    for (const question of questions) {        
        await prisma.studentQuestionGrading.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: question.id
                }
            },
            update: grading(question, undefined),
            create: {
                userEmail: studentEmail,
                questionId: question.id,
                ...grading(question, undefined)
            }
        });
    }
         
    res.status(200).json(userOnExamSession);
}

export default handler;