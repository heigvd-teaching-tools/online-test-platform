import { PrismaClient, Role, QuestionType } from '@prisma/client';
import {getUserSelectedGroup, hasRole} from '../../../utils/auth';
import {questionIncludeClause} from "../../../code/questions";

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
        case 'POST':
            await post(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const defaultMultipleChoiceOptions = {
    create: {
        options: { create: [
            { text: 'Option 1', isCorrect: false },
            { text: 'Option 2', isCorrect: true },
        ]}
    }
}

const get = async (req, res) => {
    const group = await getUserSelectedGroup(req);
    const questions = await prisma.question.findMany({
        where: {
            groupId: group.id
        },
        include: questionIncludeClause(true, true),
        orderBy: {
            updatedAt: 'desc'
        }

    });
    res.status(200).json(questions);
}

const post = async (req, res) => {

    // create a new question -> at this point we only know the question type

    const { type } = req.body;
    const questionType = QuestionType[type];

    if(!questionType) {
        res.status(400).json({ message: 'Invalid question type' });
        return;
    }

    const group = await getUserSelectedGroup(req);

    const createdQuestion = await prisma.question.create({
        data: {
            type: questionType,
            title: '',
            content: '',
            [questionType]: questionType === QuestionType.multipleChoice ? defaultMultipleChoiceOptions : {},
            group: {
                connect: {
                    id: group.id
                }
            }
        },
        include: questionIncludeClause(true, true)
    });
    res.status(200).json(createdQuestion);
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
