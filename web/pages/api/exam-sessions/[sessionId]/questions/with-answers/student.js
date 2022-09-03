import { PrismaClient, Role, QuestionType } from '@prisma/client';

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
    const { sessionId } = req.query
    const questions = await prisma.question.findMany({
        where: {
            examSession: {
                id: sessionId
            }
        },
        include: {
            code: true,
            multipleChoice: { select: { options: { select: { id: true, text: true } } } },
            essay: true,
            studentAnswer: {
                include: {
                    code: true,
                    multipleChoice: { select: { options: { select: { id: true, text: true } } } },
                    essay: true,
                    trueFalse: true,
                }
            }
        }
    });
    res.status(200).json(questions);
}

export default handler;