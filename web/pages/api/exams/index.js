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
    const { label, description } = req.body;
    try {
        const exam = await prisma.exam.create({
            data: {
                label,
                description
            }
        });
        res.status(200).json(exam);
    } catch (e) {
        switch(e.code) {
            case 'P2002':
                res.status(409).json({ message: 'Exam already exists' });
                break;
            default:
                res.status(500).json({ message: 'Internal server error' });
        }

    }



}

export default handler;
