import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';

import { hasRole, getUser } from '../../../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {

    switch(req.method) {
        case 'GET':
            await get(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const get = async (req, res) => {
    const isProf = await hasRole(req, Role.PROFESSOR);
    const isStudent = await hasRole(req, Role.STUDENT);

    if(!(isProf || isStudent)){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { sessionId } = req.query;
    const { email } = await getUser(req);
    let include = { examSession: true };

    // control the phase of the collections session
    const examSession = await prisma.examSession.findUnique({
        where: { id: sessionId },
        select: { phase: true }
    });

    if(!examSession){
        res.status(404).json({ message: 'Exam session not found' });
        return;
    }

    if(examSession.phase === ExamSessionPhase.IN_PROGRESS){
        include = {
            examSession: {
                include: {
                    questions: {
                        include: {
                            studentAnswer: {
                                where: { userEmail: email },
                                select: {
                                    status: true,
                                }
                            }
                         },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }
        }
    }

    const userOnExamSession = await prisma.userOnExamSession.findUnique({
        where: {
            userEmail_examSessionId: {
                userEmail: email,
                examSessionId: sessionId
            }
        },
        include
    });

    if(!userOnExamSession){
        res.status(403).json({ message: 'You are not allowed to access this collections session' });
        return;
    }
    res.status(200).json(userOnExamSession.examSession);
}

export default handler;
