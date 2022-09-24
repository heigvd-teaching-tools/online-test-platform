import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';

import { hasRole } from '../../../../../utils/auth';

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

    const { sessionId, email, questions } = req.query;

    let include = {
        examSession: true
    };

    if(questions === 'true'){
        include = {
            examSession: {
                include: {
                    questions: {
                        include: {
                            code: { select: { code: true } },
                            multipleChoice: { select: { options: { select: { id: true, text: true } } } },
                            essay: true,
                            studentAnswer: {
                                where: {
                                    userEmail: email
                                },
                                select: {
                                    code: true,
                                    multipleChoice: { select: { options: { select: { id: true, text: true } } } },
                                    essay: { select: { content: true } },
                                    trueFalse: true,
                                },
                                
                            }
                        },
                        orderBy: {
                            position: 'asc'
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
        res.status(403).json({ message: 'You are not allowed to access this exam session' });
        return;
    }
    res.status(200).json(userOnExamSession.examSession);
}

export default handler;