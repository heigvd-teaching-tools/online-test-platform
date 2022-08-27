import { PrismaClient, Role, QuestionType } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';

const prisma = new PrismaClient();

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
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
        },
        include: {
            questions: {
                include: {
                    questionCode: true,
                    questionMultipleChoice: true,
                    questionTrueFalse: true,
                    questionEssay: true,
                }
            }
        }
    });
    res.status(200).json(exam);
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
                    type: "CODE",
                    points: parseInt(question.points),
                    questionCode: {
                        create: {
                            code: question.typeSpecific.code
                        }
                    }
                }))
            }
        }
    });
                    
    res.status(200).json(exam);
}

export default handler;