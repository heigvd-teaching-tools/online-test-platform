import { PrismaClient, Role } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';

const prisma = new PrismaClient();


const handler = async (req, res) => {

    let isProfOrStudent = await hasRole(req, Role.PROFESSOR) || await hasRole(req, Role.STUDENT);

    if(!isProfOrStudent) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    switch(req.method) {
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const post = async (req, res) => {
    const { sessionId } = req.query;
    const { studentEmail } = req.body;
    
    const userOnExamSession = await prisma.userOnExamSession.upsert(
        {
            where: {
                userEmail_examSessionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId
                }
            },
            update: {},
            create: {
                userEmail: studentEmail,
                examSessionId: sessionId
            }
        }

    );
                        
    res.status(200).json(userOnExamSession);
}

export default handler;