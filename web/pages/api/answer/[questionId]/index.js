import { PrismaClient, Role, StudentAnswerStatus, QuestionType } from '@prisma/client';

import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import {isInProgress} from "../utils";
import {grading} from "../../../../code/grading";

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
        case 'GET':
            await get(req, res);
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
            question: {
                select: { // we only need multiple choice because we need all the options (not only those selected by the student)
                    multipleChoice: {
                        select: {
                            options: {
                                select: {
                                    id: true,
                                    text: true
                                }
                            }
                        }
                    }
                }},
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


/*
 endpoint to handle student answer related to all single level question types (without complex nesting) [true false, essay, web]
*/
const put = async (req, res) => {
    // update student answer
    const session = await getSession({ req });
    const studentEmail = session.user.email;
    const { questionId } = req.query;

    const { answer } = req.body;

    const question = await prisma.question.findUnique({
        where: {
            id: questionId
        },
        select: {
            type: true,
            examSessionId: true,
            trueFalse: true,
            essay: true,
            web: true,
            points: true
        }
    });

    if(!await isInProgress(question.examSessionId)) {
        res.status(400).json({ message: 'Exam session is not in progress' });
        return;
    }

    const status = answer === undefined ? StudentAnswerStatus.MISSING : StudentAnswerStatus.SUBMITTED;

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
                status
            }
        })
    );

    // update the typeSpecific student answer

    const { answer: data, grading, model } = prepareAnswer(question, answer);

    console.log("data", data, "grading", grading)

    transaction.push(
        model.update({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            data: data
        })
    );

    // update the grading
    transaction.push(
        prisma.studentQuestionGrading.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            create: {
                userEmail: studentEmail,
                questionId: questionId,
                ...grading
            },
            update: grading
        })
    );

    await prisma.$transaction(transaction);

    const updatedStudentAnswer = await prisma.studentAnswer.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        select: {
            status: true,
            [question.type]: true
        }
    });

    res.status(200).json(updatedStudentAnswer);
}

/*
    prepare the answer and grading for the student answer and select the correct model to update
    this function also insures that no other fields or related entities are changed by the client
*/
const prepareAnswer = (question, answer) => {
    switch(question.type) {
        case QuestionType.trueFalse:
            return {
                model: prisma.studentAnswerTrueFalse,
                answer: {
                    isTrue: answer ? answer.isTrue : null
                },
                grading: grading(question, answer)

            }
        case QuestionType.essay:
            return {
                model: prisma.studentAnswerEssay,
                answer: {
                    content: answer ? String(answer.content) : null
                },
                grading: grading(question, answer)
            }
        case QuestionType.web:
            return {
                model: prisma.studentAnswerWeb,
                answer: {
                    css: answer ? answer.css : null,
                    html: answer ? answer.html : null,
                    js: answer ? answer.js : null
                },
                grading: grading(question, answer)
            }
        default:
            return undefined;
    }
}

export default handler;
