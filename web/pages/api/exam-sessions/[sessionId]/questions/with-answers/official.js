import { PrismaClient, Role, QuestionType } from '@prisma/client';

import { hasRole } from '../../../../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {

    if(!(await hasRole(req, Role.PROFESSOR))) {
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
    const { sessionId } = req.query
    const questions = await prisma.question.findMany({
        where: {
            examSession: {
                id: sessionId
            }
        },
        include: {
            code: { select: { code: true, solution: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        },
        orderBy: {
            order: 'asc'
        }
    });
    res.status(200).json(questions);
}

export default handler;