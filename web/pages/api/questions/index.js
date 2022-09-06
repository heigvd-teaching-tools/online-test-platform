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
        case 'DELETE':
            await del(req, res);
            break;
        default:
    }
}
const patch = async (req, res) => {
    const { question } = req.body;
    // TODO : delete type specific data

    let currentQuestion = await prisma.question.findUnique({
        where: {
            id: question.id
        },
        include: {
            code: true,
            multipleChoice: true,
            trueFalse: true,
            essay: true,
        }
    });

    // TODO : do better - this is a mess
    if(currentQuestion.type !== question.type) {
        if(currentQuestion[currentQuestion.type]) {
            await prisma.question.update({
                where: {
                    id: question.id
                },
                data: {
                    type: question.type,
                    [currentQuestion.type]: {  
                        delete: true
                    },
                    [question.type]: {
                        create: prepareTypeSpecific(question.type, question)
                    }
                }
            });
        }
    }
       
    const updatedQuestion = await prisma.question.update({
        where: {
            id: question.id
        },
        data: {
            type: question.type,
            content: question.content,
            points: parseInt(question.points),
            [question.type]: {
                update: prepareTypeSpecific(question.type, question)
            }
        },
        include: {
            code: { select: { solution: true, code: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        }
    });
    res.status(200).json(updatedQuestion);
}

const del = async (req, res) => {
    const { question } = req.body;
    const deletedQuestion = await prisma.question.delete({
        where: {
            id: question.id
        }
    });
    res.status(200).json(deletedQuestion);
}

const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: { 
                    deleteMany: {},
                    createMany: {
                        data: question[questionType].options.length > 0 ? question[questionType].options : undefined,
                    }
                }
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


export default handler;