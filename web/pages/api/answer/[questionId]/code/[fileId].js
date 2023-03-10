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
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId, fileId } = req.query;

    const { file } = req.body;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        }
    });

    if(!await isInProgress(question.examSessionId)) {
        res.status(400).json({ message: 'Exam session is not in progress' });
        return;
    }

    const transaction = []; // to do in single transaction, queries are done in order

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
                status: StudentAnswerStatus.SUBMITTED, // TODO : compare with original file to see if it's the same
            }
        })
    );

    // update the student answer file for code question
    transaction.push(
        prisma.studentAnswerCodeToFile.update({
            where: {
                userEmail_questionId_fileId: {
                    userEmail: studentEmail,
                    questionId: questionId,
                    fileId: fileId
                }
            },
            data: {
                file: {
                    update: {
                        content: file.content
                    }
                }
            }
        })
    );

    // prisma transaction
    await prisma.$transaction(transaction);

    res.status(200).json({ message: 'File updated' });
}

export default handler;
