import { PrismaClient, Role, JamSessionPhase } from '@prisma/client';

import { hasRole, getUser } from '../../../../../utils/auth';
import {IncludeStrategy, questionIncludeClause} from "../../../../../code/questions";

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
    let include = { jamSession: true };

    // control the phase of the collections session
    const jamSession = await prisma.jamSession.findUnique({
        where: { id: jamSessionId },
        select: { phase: true }
    });

    if(!jamSession){
        res.status(404).json({ message: 'Exam session not found' });
        return;
    }

    let includeClause = questionIncludeClause({
        includeTypeSpecific: false,
        includeUserAnswers: {
            strategy: IncludeStrategy.USER_SPECIFIC,
            userEmail: email
        }}
    );

    if(jamSession.phase === JamSessionPhase.IN_PROGRESS){
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
        res.status(403).json({ message: 'You are not allowed to access this jam session' });
        return;
    }
    res.status(200).json(userOnJamSession.jamSession);
}

export default handler;
