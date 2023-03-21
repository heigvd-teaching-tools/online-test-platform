import { PrismaClient, Role, StudentAnswerStatus } from '@prisma/client';

import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../utils/auth';
import {isInProgress} from "../../utils";
import { grading } from '../../../../../code/grading';

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
        case 'DELETE':
            await addOrRemoveOption(req, res);
            break;
        default:
            break;
    }
}

const addOrRemoveOption = async (req, res) => {
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId } = req.query;

    const toAdd = req.method === 'POST';

    const { option } = req.body;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            examSessionId: true,
            type: true,
            points: true,
            multipleChoice:{
                select: {
                    options: true
                }
            }
        }
    });

    if(!await isInProgress(question.examSessionId)) {
        res.status(400).json({ message: 'Exam session is not in progress' });
        return;
    }

    let status = StudentAnswerStatus.SUBMITTED;

    if(!toAdd){ // toRemove
        // check if the option to remove is the only one selected, if so, set status to missing
        const studentAnswer = await prisma.studentAnswerMultipleChoice.findUnique({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            select: {
                options: true
            }
        });

        if(studentAnswer.options.length === 1) {
            status = StudentAnswerStatus.MISSING;
        }
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
                status,
            }
        })
    );

    // add option to student multi-choice answer
    transaction.push(
        prisma.studentAnswerMultipleChoice.update({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            data: {
                options: {
                    [toAdd ? 'connect' : 'disconnect']: {
                        id: option.id
                    }
                }
            }
        })
    );


    // prisma transaction
    await prisma.$transaction(transaction);

    // get the updated student answer
    const studentAnswer = await prisma.studentAnswerMultipleChoice.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        select: {
            options: true
        }
    });

    // grade the student answer
    await prisma.studentQuestionGrading.upsert({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        create: {
            userEmail: studentEmail,
            questionId: questionId,
            ...grading(question, studentAnswer)

        },
        update: grading(question, studentAnswer)
    });

    const updatedStudentAnswer = await prisma.studentAnswer.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        select: {
            status: true,
            multipleChoice: {
                include: {
                    options: true
                }
            }
        }
    });

    res.status(200).json(updatedStudentAnswer);
}

export default handler;