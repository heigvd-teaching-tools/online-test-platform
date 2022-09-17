import { PrismaClient, Role, StudentAnswerGradingStatus } from '@prisma/client';
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
                },
                studentAnswerGrading: {
                    update: gradeAnswer(question, answer)
                }
            },
            create: {
                userEmail: studentEmail,
                questionId: questionId,
                [type]: {
                    create: prepareAnswer(type, answer, 'create')
                },
                studentAnswerGrading: {
                    create: gradeAnswer(question, answer)
                }

            }
        });
    }
    res.status(200).json(a);
}

const gradeAnswer = (question, answer) => {
    switch(question.type) {
        case 'multipleChoice':
            return gradeMultipleChoice(question, answer);
        case 'trueFalse':
            return gradeTrueFalse(question, answer);
        case 'essay':
            return gradeEssay(question, answer);
        case 'code':
            return gradeCode(question, answer);
        default:
            return undefined;
    }
}

const gradeMultipleChoice = (question, answer) => {
    let correctOptions = question.multipleChoice.options.filter((opt) => opt.isCorrect);
    let answerOptions = answer.options;
    let isCorrect = correctOptions.length === answerOptions.length && correctOptions.every((opt) => answerOptions.some((aOpt) => aOpt.id === opt.id));
    return {
        status: StudentAnswerGradingStatus.AUTOGRADED,
        pointsObtained: isCorrect ? question.points : 0,
        isCorrect
    }
}

const gradeTrueFalse = (question, answer) => {
    let isCorrect = question.trueFalse.isTrue === answer.isTrue;
    return {
        status: StudentAnswerGradingStatus.AUTOGRADED,
        pointsObtained: isCorrect ? question.points : 0,
        isCorrect
    }
}

const gradeEssay = () => ({
    status: StudentAnswerGradingStatus.UNGRADED,
    pointsObtained: 0,
    isCorrect: false
});

const gradeCode = () => ({
    status: StudentAnswerGradingStatus.UNGRADED,
    pointsObtained: 0,
    isCorrect: false
});

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