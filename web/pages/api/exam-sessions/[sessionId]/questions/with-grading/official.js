import { PrismaClient, Role } from '@prisma/client';

import { hasRole } from '../../../../../../utils/auth';
import { includeQuestions, IncludeStrategy } from '../../../../../../code/questions';

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
    const { sessionId } = req.query;

    let query = includeQuestions({
        parentResource: 'examSession',
        parentResourceId: sessionId,
        includeTypeSpecific: true,
        includeOfficialAnswers: true,
        includeUserAnswers: {
            strategy: IncludeStrategy.ALL
        },
        includeGradings: true
    });
    
    const questions = await prisma.question.findMany({
        ...query,
        orderBy: {
            order: 'asc'
        }
    });
    res.status(200).json(questions);
}

export default handler;