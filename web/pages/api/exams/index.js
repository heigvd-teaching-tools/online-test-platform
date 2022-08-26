import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { hasRole } from '../../../utils/auth';

const prisma = new PrismaClient();

const handler = async (req, res) => {

    if(!(await hasRole(req, Role.PROFESSOR))) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    switch(req.method) {
        case 'GET':
            await get(res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }

    
}

const get = async (res) => {
    const exams = await prisma.exam.findMany({
        include: {
            questions: true
        },
    });
    res.status(200).json(exams);
}



const post = async (req, res) => {
    const { label, description, questions } = req.body;
    console.log(label, description, questions);
    const exam = await prisma.exam.create({
        data: {
            label,
            description,
            questions: {
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