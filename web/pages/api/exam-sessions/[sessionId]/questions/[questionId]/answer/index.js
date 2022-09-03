import { PrismaClient, Role } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../../../utils/auth';

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

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
            break;
    }
}

const post = async (req, res) => {
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { sessionId, questionId } = req.query;
    
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    const { type } = question;
    const { answer } = req.body;
    
    let a;
    if(answer === undefined) {
        a = await prisma.studentAnswer.delete({
            where: {
                userEmail_examSessionId_questionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId,
                    questionId: questionId
                }
            }
        });
    }else{
        a = await prisma.studentAnswer.upsert({
            where: {
                userEmail_examSessionId_questionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId,
                    questionId: questionId
                }
            },
            update: {
                [type]: {
                    update: prepareUpdateAnswer(type, answer)
                }
            },
            create: {
                userEmail: studentEmail,
                examSessionId: sessionId,
                questionId: questionId,
                [type]: {
                    create: prepareCreateAnswer(type, answer)
                }
            }
        });
    }
    res.status(200).json(a);
}


const prepareUpdateAnswer = (questionType, answer) => {
    switch(questionType) {
        case 'multipleChoice':
            return {
                options: {
                    set: [],
                    connect: answer.filter(o => o.isCorrect).map((opt) => ({ id: opt.id }))               
                }
            }
        case 'trueFalse':
            return {
                isTrue: answer
            }
        case 'essay':
            break;
        case 'code':
            break;
        default:
            return undefined;
    }
}

const prepareCreateAnswer = (questionType, answer) => {
    switch(questionType) {
        case 'multipleChoice':
            return {
                options: {
                    connect: answer.filter(o => o.isCorrect).map((opt) => ({ id: opt.id }))               
                }
            }
        case 'trueFalse':
            return {
                isTrue: answer
            }
        case 'essay':
            break;
        case 'code':
            break;
        default:
            return undefined;
    }
}
            


export default handler;