import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';

import { hasRole } from '../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
    const isProf = await hasRole(req, Role.PROFESSOR);
    if(!isProf){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    switch(req.method) {
        case 'PATCH':
            await patch(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const patch = async (req, res) => {
    
    const { grading: { 
            questionId, 
            userEmail, 
            pointsObtained, 
            comment, 
            signedBy,
            status
        } } = req.body;

    const updatedGrading = await prisma.studentQuestionGrading.update({
        where: {
            userEmail_questionId: {
                userEmail: userEmail,
                questionId: questionId
            }
        },
        data: {
            status: status,
            pointsObtained: pointsObtained,
            signedByUserEmail: signedBy ? signedBy.email : null, 
            comment: comment
        },
        include: {
            signedBy: true
        }  
    });

    res.status(200).json(updatedGrading);

}

export default handler;