import { PrismaClient, Role } from '@prisma/client';
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
    const exams = await prisma.examSession.findMany({
        include: {
            questions: true,
            students: true
        },
    });
    res.status(200).json(exams);
}

const post = async (req, res) => {
    const { label, conditions } = req.body;
    const examSession = await prisma.examSession.create({
        data: {
            label,
            conditions,
        }
    });
                    
    res.status(200).json(examSession);
}

export default handler;