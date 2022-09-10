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
        case 'POST':
            await post(req, res);
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
            multipleChoice: { select: { options: { select: { id:true, text:true, isCorrect:true }} } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        },
        orderBy: {
            position: 'asc'
        }
    });
    res.status(200).json(questions);
}

const post = async (req, res) => {
    const { examId } = req.query
    const { position } = req.body;
    const createdQuestion = await prisma.question.create({
        data: {
            type: 'multipleChoice',
            content: '',
            points: 4,
            position: position,
            multipleChoice: {
                create: {
                    options: { create: [
                        { text: 'Option 1', isCorrect: false },
                        { text: 'Option 2', isCorrect: true },
                    ]}
                }
            },
            exam: {
                connect: {
                    id: examId
                }
            }
        },
        include: {
            code: { select: { solution: true, code: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        }
    });
    res.status(200).json(createdQuestion);
}

export default handler;