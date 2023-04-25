import { PrismaClient, Role } from '@prisma/client';
import { hasRole  } from '../../../../utils/auth';

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
        case 'PUT':
            await put(req, res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const put = async (req, res) => {
    // update the order of the questions in the collection
    const { collectionToQuestions } = req.body;

    // update the order of the questions in the collection
    for (const [index, collectionToQuestion] of collectionToQuestions.entries()) {
        await prisma.collectionToQuestion.update({
            where: {
                collectionId_questionId: {
                    collectionId: collectionToQuestion.collectionId,
                    questionId: collectionToQuestion.questionId
                }
            },
            data: {
                order: collectionToQuestion.order
            }
        });
    }

    res.status(200).json({ message: 'OK' });
}


export default handler;
