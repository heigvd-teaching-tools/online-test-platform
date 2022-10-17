import { PrismaClient, Role, ExamSessionPhase, StudentAnswerStatus, QuestionType } from '@prisma/client';
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
            essay: true,
            web: true,
        } 
    });

     // get the question exam session phase
     const examSession = await prisma.examSession.findUnique({
        where: {
            id: question.examSessionId
        },
        select: {
            phase: true
        }
    });

    
    if(examSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        res.status(400).json({ message: 'The exam session is not in the in-progress phase' });
        return;
    }

    const { type } = question;
    const { answer } = req.body;
    
    let status = answer ? StudentAnswerStatus.SUBMITTED : StudentAnswerStatus.MISSING;

    let a = await prisma.studentAnswer.update({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        data: {
            status,
            [type]: {
                update: prepareAnswer(type, answer, 'update')
            }
        }
    });
    
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
        case QuestionType.multipleChoice:
            let options = {};
            // the order of the properties is important, first set than connect
            if(mode === 'update') {
                // remove eventual existing options
                options.set = [];
            }
            options.connect = answer ? answer.options.map((opt) => ({ id: opt.id })) : [];
            return {
                options
            }
        case QuestionType.trueFalse:
            return {
                isTrue: answer ? answer.isTrue : null
            }
        case QuestionType.essay: 
            return {
                content: answer ? String(answer.content) : null
            }
        case QuestionType.code:
            return {
                code: answer ? String(answer.code) : null
            }
        case QuestionType.web:
            return {
                css: answer ? answer.css : null,
                html: answer ? answer.html : null,
                js: answer ? answer.js : null
            }
        default:
            return undefined;
    }
}        

export default handler;