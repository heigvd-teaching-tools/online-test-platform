import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { getSession } from 'next-auth/react';

import { hasRole } from '../../../../../../utils/auth';

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
        case 'GET':
            await get(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    
    const session = await getSession({ req });
    const studentEmail = session.user.email;

    const { sessionId : examSessionId } = req.query

    const questions = await prisma.question.findMany({
        where: {
            examSession: {
                id: examSessionId
            }
        },
        include: {
            code: { select: { code: true } },
            multipleChoice: { select: { options: { select: { id: true, text: true } } } },
            essay: true,
            studentAnswer: {
                where: {
                    userEmail: studentEmail
                },
                select: {
                    code: true,
                    multipleChoice: { select: { options: { select: { id: true, text: true } } } },
                    essay: { select: { content: true } },
                    trueFalse: true,
                },
                
            }
        },
        orderBy: {
            position: 'asc'
        }
    });
    res.status(200).json(questions);
}

export default handler;