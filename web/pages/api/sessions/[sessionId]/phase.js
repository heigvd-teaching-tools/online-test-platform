import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
    const isProf = await hasRole(req, Role.PROFESSOR);
    const isStudent = await hasRole(req, Role.STUDENT);
    if(!(isProf || isStudent)){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    switch(req.method) {
        case 'GET':
            await get(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    const { sessionId } = req.query;
    const exam = await prisma.examSession.findUnique({
        where: {
            id: sessionId
        },
        select: {
            phase: true
        }
    });
    res.status(200).json(exam);
}

export default handler;