import {PrismaClient, QuestionType, Role} from '@prisma/client';
import {questionIncludeClause, questionTypeSpecific} from '../../../../code/questions';
import { hasRole, getUserSelectedGroup } from '../../../../utils/auth';

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
        default:
    }
}

const get = async (req, res) => {
    // get a question by id

    const { questionId } = req.query;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        include: questionIncludeClause(true, true)
    });
    res.status(200).json(question);
}

const patch = async (req, res) => {
    const { question } = req.body;

    const updatedQuestion = await prisma.question.update({
        where: { id: question.id },
        data: {
            title: question.title,
            content: question.content,
            [question.type]: {
                update: questionTypeSpecific(question.type, question)
            }
        },
        include: {
            code: { select: { language: true } },
            multipleChoice: { select: { options: { select: { text: true, isCorrect:true } } } },
            trueFalse: { select: { isTrue: true } },
            essay: true,
            web: true
        }
    });

    res.status(200).json(updatedQuestion);
}




export default handler;
