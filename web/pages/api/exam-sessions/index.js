import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { hasRole } from '../../../utils/auth';
import { ExamSessionPhase } from '@prisma/client';

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
            await get(res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const get = async (res) => {
    const exams = await prisma.examSession.findMany({
        include: {
            questions: true,
            students: true
        },
    });
    res.status(200).json(exams);
}

const post = async (req, res) => {
    const { questions } = req.body;
    const examSession = await prisma.examSession.create({
        data: {
            phase: ExamSessionPhase.DRAFT,
            questions: {
                create: questions.map(question => ({
                    content: question.content,
                    type: question.type,
                    points: parseInt(question.points),
                    order: parseInt(question.order),
                    [question.type]: {
                        create: prepareTypeSpecific(question.type, question)
                    }
                }))
            }
        }
    });
                    
    res.status(200).json(examSession);
}

const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            let options = question.multipleChoice.options.map(option => ({
                text: option.text,
                isCorrect: option.isCorrect
            }));
            return {
                options: { create: options.length > 0 ? options : undefined }
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

export default handler;