import { PrismaClient, Role, JamSessionPhase } from '@prisma/client';

import { hasRole, getUser } from '../../../../../utils/auth';
import { questionIncludeClause, IncludeStrategy } from '../../../../../code/questions';

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

    const { jamSessionId } = req.query;
    const { email } = await getUser(req);
    let include = { examSession: true };

    // control the phase of the collections session
    const jamSession = await prisma.jamSession.findUnique({
        where: { id: jamSessionId },
        select: { phase: true }
    });

    if(!jamSession){
        res.status(404).json({ message: 'Jam session not found' });
        return;
    }

    if(jamSession.phase === JamSessionPhase.FINISHED){
        let includeClause = questionIncludeClause({
            includeTypeSpecific: true,
            includeUserAnswers: {
                strategy: IncludeStrategy.USER_SPECIFIC,
                userEmail: email
            }}
        );

        include = {
            jamSession: {
                include: {
                    jamSessionToQuestions: {
                        include: {
                            question: {
                                include: includeClause
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

    const userOnJamSession = await prisma.userOnJamSession.findUnique({
        where: {
            userEmail_jamSessionId: {
                userEmail: email,
                jamSessionId: jamSessionId
            }
        },
        include
    });

    if(!userOnJamSession){
        res.status(403).json({ message: 'You are not allowed to access this collections session' });
        return;
    }
    res.status(200).json(userOnJamSession.jamSession);
}

export default handler;
