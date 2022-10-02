import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';

import { buildPrismaQuestionsQuery } from '../../../../code/questions';

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
    }
}

const post = async (req, res) => {
    const { sessionId } = req.query;
    const session = await getSession({ req });
    const studentEmail = session.user.email;

    const userOnExamSession = await prisma.userOnExamSession.upsert({
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
    });

    let selectQuery = buildPrismaQuestionsQuery({
        parentResource: 'examSession',
        parentResourceId: sessionId,
        includeTypeSpecific: true
    });

    // add empty answers and gradings for each question
    const questions = await prisma.question.findMany(selectQuery);

    for (const question of questions) {   
        let query = {
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: question.id
                }
            },
            update: {},
            create: {
                userEmail: studentEmail,
                questionId: question.id,
                [question.type]: {
                    create: prepareTypeSpecific(question.type, question)
                },
                studentGrading: {
                    create: grading(question, undefined)
                }
            }
        }
        await prisma.studentAnswer.upsert(query);
    }
         
    res.status(200).json(userOnExamSession);
}

const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: {
                    create: []
                }
            }
        case QuestionType.trueFalse:
            return {
                isTrue: null
            }
        case QuestionType.code:
            return {
                code: question.code.code,
            }
        case QuestionType.essay:
            return {
                content: ''
            }
        default:
            return {}
    }
}

export default handler;