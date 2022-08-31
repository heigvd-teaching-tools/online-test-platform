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
    const exams = await prisma.examSession.findMany({
        include: {
            questions: true,
            participants: true
        },
    });
    res.status(200).json(exams);
}

const post = async (req, res) => {
    const { label } = req.body;
    const exam = await prisma.examSession.create({
        data: {
            label
        }
    });
                    
    res.status(200).json(exam);
}

export default handler;