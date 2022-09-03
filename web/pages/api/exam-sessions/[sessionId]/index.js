import { PrismaClient, Role, QuestionType } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';

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
    const { sessionId } = req.query
    const exam = await prisma.examSession.findUnique({
        where: {
            id: sessionId
        },
        include: {
            students: {
                select: {
                    user: true
                }   
            }
        }
    });
    res.status(200).json(exam);
}

const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: { create: question[questionType].options.length > 0 ? question[questionType].options : undefined }
            };
        case QuestionType.trueFalse:
            return question[questionType];
        case QuestionType.essay:
            return {}
        case QuestionType.code:
            return question[questionType]
        default:
            return undefined;
    }
}

const post = async (req, res) => {
    const { sessionId } = req.query
    const { label, conditions, phase, questions } = req.body;
    const examSession = await prisma.examSession.update({
        where: {
            id: sessionId
        },
        data: {
            label,
            conditions,
            phase,
            questions: {
                deleteMany: {},
                create: questions.map(question => ({
                    content: question.content,
                    type: question.type,
                    points: parseInt(question.points),
                    [question.type]: {
                        create: prepareTypeSpecific(question.type, question)
                    }
                }))
            }
        }
    });
                    
    res.status(200).json(examSession);
}

export default handler;