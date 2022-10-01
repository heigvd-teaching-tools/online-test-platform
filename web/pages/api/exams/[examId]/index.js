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
        case 'PATCH':
            await patch(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    const { examId } = req.query
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
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

const patch = async (req, res) => {
    const { examId } = req.query
    const { label, description, questions } = req.body;

    let data = {
        label,
        description,
    }

    if(questions) {
        data.questions = {
            deleteMany: {},
            create: questions.map(question => ({
                content: question.content,
                type: question.type,
                points: parseInt(question.points),
                order: parseInt(question.order),
                [question.type]: {
                    create: prepareTypeSpecific(question.type, question)
                }
            }))
        };
    }

    const exam = await prisma.exam.update({
        where: {
            id: examId
        },
        data: data
    });
                    
    res.status(200).json(exam);
}

const del = async (req, res) => {
    const { examId } = req.query
    const exam = await prisma.exam.delete({
        where: {
            id: examId
        }
    });
    res.status(200).json(exam);
}

export default handler;