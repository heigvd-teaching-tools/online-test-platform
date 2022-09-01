import { PrismaClient, Role } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../../utils/auth';

const prisma = new PrismaClient();

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
            break;
    }
}

const post = async (req, res) => {
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { sessionId, questionId } = req.query;
    
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    const { type } = question;
    const { answer } = req.body;
    
    let a;
    if(answer.isTrue === undefined) {
        a = await prisma.answer.delete({
            where: {
                userEmail_examSessionId_questionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId,
                    questionId: questionId
                }
            }
        });
    }else{
        a = await prisma.answer.upsert({
            where: {
                userEmail_examSessionId_questionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId,
                    questionId: questionId
                }
            },
            update: {
                [type]: {
                    update: {
                        isTrue: answer.isTrue
                    }
                }
            },
            create: {
                userEmail: studentEmail,
                examSessionId: sessionId,
                questionId: questionId,
                [type]: {
                    create: {
                        isTrue: answer.isTrue
                    }
                }
            }
        });
    }
    res.status(200).json(a);
}

export default handler;