import { PrismaClient, Role } from '@prisma/client';
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
    const { examId } = req.query;



    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
        }
    });
    res.status(200).json(exam);
}

const patch = async (req, res) => {
    const { examId } = req.query
    const { label, description } = req.body;

    let data = {
        label,
        description,
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