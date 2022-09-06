import { PrismaClient, Role, QuestionType } from '@prisma/client';

import { hasRole } from '../../../utils/auth';

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
        case 'PATCH':
            await patch(req, res);
            break;
        default:
    }
}

const patch = async (req, res) => {
    // Update question positions
    const { questions } = req.body;
    for(let i = 0; i < questions.length; i++) {
        await prisma.question.update({
            where: {
                id: questions[i].id
            },
            data: {
                position: i
            }
        });
    }
    res.status(200).json({ message: 'Question positions updated' });
}

export default handler;
