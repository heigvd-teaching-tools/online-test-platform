import { PrismaClient, Role } from '@prisma/client';

import { questionIncludeClause } from '../../../../../../code/questions';
import {getUserSelectedGroup, hasRole} from '../../../../../../utils/auth';

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
    const { jamSessionId } = req.query;
    const group = await getUserSelectedGroup(req);

    const questions = await prisma.jamSessionToQuestion.findMany({
        where:{
            jamSessionId: jamSessionId,
            question: {
                groupId: group.id
            }
        },
        include: {
            question: {
                include: questionIncludeClause(true, true)
            }
        },
        orderBy: {
            order: 'asc'
        }
    });
    res.status(200).json(questions);
}

export default handler;
