import { PrismaClient, Role, ExamSessionPhase, StudentAnswerStatus, QuestionType } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';
import {isInProgress} from "../utils";
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
        case "GET":
            await get(req, res);
            break;
        case 'PUT':
            await put(req, res);
            break;
        default:
            break;
    }
}

const get = async (req, res) => {
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId } = req.query;

    // get the student answer for a question including related nested data
    const studentAnswer = await prisma.studentAnswer.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        include: {
            code: { select: { files: { select: { studentPermission: true, file: true }, orderBy: [{ file: { createdAt: "asc" } }, { file: { questionId: "asc" } }] } } },
            multipleChoice: { select: { options: true } },
            trueFalse: true,
            essay: true,
            web: true,
        }
    });

    if(!studentAnswer) {
        res.status(404).json({ message: 'Student answer not found' });
        return;
    }

    res.status(200).json(studentAnswer);
}

const put = async (req, res) => {
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId } = req.query;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            type: true,
            examSessionId: true
        }
    });


    if(!await isInProgress(question.examSessionId)) {
        res.status(400).json({ message: 'Exam session is not in progress' });
        return;
    }

    const { type } = question;

    const { answer } = req.body;

    let status = answer ? StudentAnswerStatus.SUBMITTED : StudentAnswerStatus.MISSING;

    const answerQuery = prepareAnswerByType(type, answer)

    await prisma.studentAnswer.update({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        data: {
            status: status,
            [type]: {
                update: answerQuery
            }
        }
    });

    res.status(200).json({ message: 'Student answer updated' });
}

const prepareAnswerByType = (questionType, answer, mode) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            // TODO : create separate endpoint, see /code
            let options = {};
            // the order of the properties is important, first set than connect

            // remove eventual existing options
            options.set = [];

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
