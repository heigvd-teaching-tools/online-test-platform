import { PrismaClient, Role } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../../../utils/auth';
import { grading } from '../../../../../../../code/grading';
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
            studentAnswer: true,
            code: { select: { code: true, solution: true } },
            multipleChoice: { select: { options: true } },
            trueFalse: { select: { isTrue: true } },
            essay: true
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
                    update: prepareAnswer(type, answer, 'update')
                }
            },
            create: {
                userEmail: studentEmail,
                questionId: questionId,
                [type]: {
                    create: prepareAnswer(type, answer, 'create')
                }
            }
        });
    }

    // grade question
    await prisma.studentQuestionGrading.upsert({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        update: grading(question, answer), 
        create: {
            userEmail: studentEmail,
            questionId: questionId,
            ...grading(question, answer)
        }
    });
    
    res.status(200).json(a);
}

const prepareAnswer = (questionType, answer, mode) => {
    switch(questionType) {
        case 'multipleChoice':
            let options = {};
            // the order of the properties is important, first set than connect
            if(mode === 'update') {
                // remove eventual existing options
                options.set = [];
            }
            options.connect = answer.options.map((opt) => ({ id: opt.id })) 
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