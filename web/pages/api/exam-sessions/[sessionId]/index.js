import { PrismaClient, Role, QuestionType, ExamSessionPhase } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';

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
        case 'GET':
            await get(req, res);
            break;
        case 'PATCH':
            await patch(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    const { sessionId } = req.query
    const exam = await prisma.examSession.findUnique({
        where: {
            id: sessionId
        },
        include: {
            students: {
                select: {
                    user: true
                }   
            }
        }
    });
    res.status(200).json(exam);
}


const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: { create: question[questionType].options.length > 0 ? question[questionType].options : undefined }
            };
        case QuestionType.trueFalse:
            return question[questionType];
        case QuestionType.essay:
            return {}
        case QuestionType.code:
            return question[questionType]
        default:
            return undefined;
    }
}

const patch = async (req, res) => {
    const { sessionId } = req.query

    const currentExamSession = await prisma.examSession.findUnique({
        where: {
            id: sessionId
        },
        select: {
            phase: true
        }
    });    
    
    if(!currentExamSession) {
        res.status(404).json({ message: 'Exam session not found' });
        return;
    }

    const { phase:nextPhase, label, conditions, questions, duration, endAt } = req.body;
    
    let data = {};

    if(nextPhase){
        data.phase = nextPhase;
    }

    if(label){
        data.label = label;
    }

    if(conditions){
        data.conditions = conditions;
    }

    if(questions){
        data.questions = {
            deleteMany: {},
            create: questions.map(question => ({
                content: question.content,
                type: question.type,
                points: parseInt(question.points),
                [question.type]: {
                    create: prepareTypeSpecific(question.type, question)
                }
            }))
        }
    }

    if(duration){
        data.startAt = new Date();
        data.endAt = new Date(new Date().getTime() + duration.hours * 60 * 60 * 1000 + duration.minutes * 60 * 1000);
    }

    if(endAt){
        data.endAt = endAt;
    }

    const examSessionAfterUpdate = await prisma.examSession.update({
        where: {
            id: sessionId
        },
        data: data
    });
                    
    res.status(200).json(examSessionAfterUpdate);
}

const del = async (req, res) => {
    const { sessionId } = req.query
    const examSession = await prisma.examSession.delete({
        where: {
            id: sessionId
        }
    });
    res.status(200).json(examSession);
}

export default handler;