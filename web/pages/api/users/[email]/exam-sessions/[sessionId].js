import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';

import { hasRole } from '../../../../../utils/auth';
import { buildPrismaQuestionsQuery, IncludeStrategy } from '../../../../../code/questions';

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
        // control the phase of the exam session
        const examSession = await prisma.examSession.findUnique({
            where: { id: sessionId },
            select: { phase: true }
        });
        if(examSession.phase === ExamSessionPhase.IN_PROGRESS){
            let questionsQuery = buildPrismaQuestionsQuery({
                includeTypeSpecific: true,
                includeUserAnswers: {
                    strategy: IncludeStrategy.USER_SPECIFIC,
                    userEmail: email
                }
            });

            include = {
                examSession: {
                    include: {
                        questions: {
                            ...questionsQuery,
                            orderBy: {
                                order: 'asc'
                            }
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