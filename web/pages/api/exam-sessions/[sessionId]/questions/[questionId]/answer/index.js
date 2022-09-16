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
    const { questionId } = req.query;
    
    const question = await prisma.question.findUnique({ 
        where: { 
            id: questionId 
        },
        include: {
            studentAnswer: true
        } 
    });
    const { type } = question;
    const { answer } = req.body;
    let a;
    if(answer === undefined) {
        // remove eventual existing answer
        if(question.studentAnswer){
            a = await prisma.studentAnswer.delete({
                where: {
                    userEmail_questionId: {
                        userEmail: studentEmail,
                        questionId: questionId
                    }
                }
            });
        }
    }else{
        a = await prisma.studentAnswer.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            update: {
                [type]: {
                    update: await prepareAnswer(type, answer, 'update')
                }
            },
            create: {
                userEmail: studentEmail,
                questionId: questionId,
                [type]: {
                    create: await prepareAnswer(type, answer, 'create')
                }
            }
        });
    }
    res.status(200).json(a);
}

const prepareAnswer = async (questionType, answer, mode) => {
    switch(questionType) {
        case 'multipleChoice':
            let options = {
                connect: answer.options.map((opt) => ({ id: opt.id }))               
            }
            if(mode === 'update') {
                // remove eventual existing options
                options.set = [];
            }
            return {
                options
            }
        case 'trueFalse':
            return {
                isTrue: answer.isTrue
            }
        case 'essay': 
            return {
                content: String(answer.content)
            }
        case 'code':
            return {
                code: String(answer.code)
            }
        default:
            return undefined;
    }
}        

export default handler;