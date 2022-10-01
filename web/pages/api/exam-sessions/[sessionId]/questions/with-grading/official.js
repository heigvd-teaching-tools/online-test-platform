import { PrismaClient, Role } from '@prisma/client';

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
            multipleChoice: { select: { options: true } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
            studentAnswer: {
                select: {
                    user: true,
                    code: true,
                    multipleChoice: { select: { options: true } },
                    essay: { select: { content: true } },
                    trueFalse: true,
                    studentGrading: {
                        select: {
                            questionId: true,
                            userEmail: true,
                            createdAt: true,
                            status: true,
                            pointsObtained: true,
                            signedBy: true,
                            comment: true,
                        }
                    }
                }
            }
        },
        orderBy: {
            order: 'asc'
        }
    });
    res.status(200).json(questions);
}

export default handler;