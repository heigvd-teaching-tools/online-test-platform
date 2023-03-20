import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { questionTypeSpecific } from '../../../code/questions';
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
    // TODO : Control the data in the database

    let currentQuestion = await prisma.question.findUnique({
        where: {
            id: question.id
        },
        include: {
            code: true,
            multipleChoice: {
                include: {
                    options: true
                }
            },
            trueFalse: true,
            essay: true,
            web: true
        }
    });

    let data;

    if(currentQuestion.type !== question.type) {
        if(currentQuestion[currentQuestion.type]) {
            // when question type changes, delete the old type specific data and create the new one
            data = {
                type: question.type,
                    [currentQuestion.type]: { delete: true },
                    [question.type]: { create: questionTypeSpecific(question) }
            };
        }
    }else{
        // when question type doesn't change, update the type specific data
        data = {
            type: question.type,
                content: question.content,
                points: parseInt(question.points),
                [question.type]: {
                update: questionTypeSpecific(question)
            }
        }
    }

    const updatedQuestion = await prisma.question.update({
        where: { id: question.id },
        data: data,
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

const del = async (req, res) => {
    const { question } = req.body;
    if(!question.id){
        res.status(400).json({ message: 'Bad Request' });
        return;
    }

    const deletedQuestion = await prisma.question.delete({
        where: {
            id: question.id
        }
    });

    // decrease the order of all questions after the deleted one
    const questions = await prisma.question.findMany({
        where: {
            examId: question.examId,
            examSessionId: question.examSessionId,
            order: {
                gt: question.order
            }
        }
    });

    for(const q of questions) {
        await prisma.question.update({
            where: {
                id: q.id
            },
            data: {
                order: q.order - 1
            }
        });
    }

    res.status(200).json(deletedQuestion);
}


export default handler;
