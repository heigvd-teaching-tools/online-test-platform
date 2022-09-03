import { PrismaClient, Role } from '@prisma/client';

import { hasRole } from '../../../../../utils/auth';

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
    const { examId } = req.query
    const questions = await prisma.question.findMany({
        where: {
            exam: {
                id: examId
            }
        },
        include: {
            code: { select: { solution: true, code: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        }
    });
    res.status(200).json(questions);
}

export default handler;