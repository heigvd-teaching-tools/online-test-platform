import { PrismaClient, Role, QuestionType } from '@prisma/client';

import { hasRole } from '../../../../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const typeSpecificTemplate = {
    'code' : { 'content' : '' },
    'trueFalse' : {},
    'multipleChoice': {
        'options': []
    }
};

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
    const questions = await prisma.question.findMany({
        where: {
            examSession: {
                id: sessionId
            }
        },
        include: {
            code: { select: { content: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
        }
    });
    res.status(200).json(questions.map((question) => ({
        ...question, 
        typeSpecific: {
            ...typeSpecificTemplate,
            [question.type]: question[question.type]
        }
    })));
}

const prepareTypeSpecific = (questionType, {typeSpecific}) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: {
                    create: typeSpecific.multipleChoice.options.length > 0 ? typeSpecific.multipleChoice.options : undefined
                }
            };
        case QuestionType.trueFalse:
            return typeSpecific.trueFalse
        case QuestionType.essay:
            return {}
        case QuestionType.code:
            return typeSpecific.code
        default:
            return undefined;
    }

}

const post = async (req, res) => {
    const { examId } = req.query
    const { label, description, questions } = req.body;
    const exam = await prisma.exam.update({
        where: {
            id: examId
        },
        data: {
            label,
            description,
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
                    
    res.status(200).json(exam);
}

export default handler;