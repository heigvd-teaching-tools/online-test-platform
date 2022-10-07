import { PrismaClient, Role, ExamSessionPhase } from '@prisma/client';
import { hasRole } from '../../../utils/auth';
import { questionTypeSpecific } from '../../../code/questions';

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
    const { label, conditions, duration, questions } = req.body;

    if(!questions || questions && questions.length === 0){
        res.status(400).json({ message: 'You exam session has no questions. Please select the reference exam.' });
        return;
    }

    if(label.length === 0){
        res.status(400).json({ message: 'You exam session has no label. Please enter a label.' });
        return;
    }

    let data = {
        phase: ExamSessionPhase.DRAFT,
        label,
        conditions,
        questions: {
            create: questions.map(question => ({
                content: question.content,
                type: question.type,
                points: parseInt(question.points),
                order: parseInt(question.order),
                [question.type]: {
                    create: questionTypeSpecific(question.type, question)
                }
            }))
        }
    }

    if(duration){
        data.durationHours = parseInt(duration.hours);
        data.durationMins = parseInt(duration.minutes);
    }
    try {
        const examSession = await prisma.examSession.create({ data });
                    
        res.status(200).json(examSession);
    } catch (e) {
        switch(e.code){
            case 'P2002':
                res.status(409).json({ message: 'Exam session label already exists' });
                break;
            default:
                res.status(500).json({ message: 'Error while updating exam session' });
                break;
        }
    }    

}


export default handler;