import { PrismaClient, Role, StudentAnswerStatus } from '@prisma/client';

import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../utils/auth';
import {isInProgress} from "../../utils";

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
            case 'PUT':
                await put(req, res);
                break;
            default:
                break;
        }
}

const put = async (req, res) => {
    // update true false student answer
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId } = req.query;

    const { web } = req.body;

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

    const transaction = []; // to do in single transaction, queries are done in order

    const status = web.html || web.css || web.js ? StudentAnswerStatus.SUBMITTED : StudentAnswerStatus.MISSING;

    // update the status of the student answer
    transaction.push(
        prisma.studentAnswer.update({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            data: {
                status
            }
        })
    );

    // update the essay student answer
    transaction.push(
        prisma.studentAnswerWeb.update({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            data: {
                html: web.html,
                css: web.css,
                js: web.js
            }
        })
    );

    await prisma.$transaction(transaction);

    res.status(200).json({ message: 'Answer updated' });
}

export default handler;
