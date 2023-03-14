import { PrismaClient, Role, QuestionType, ExamSessionPhase } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';
import { phaseGT } from "../../../../code/phase";

import { questionsWithIncludes } from '../../../../code/questions';

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

    const examSession = await prisma.examSession.findUnique({
        where: {
            id: sessionId
        }
    });

    if(!examSession) {
        res.status(404).json({ message: 'Not found' });
        return;
    }

    if(phaseGT(examSession.phase, ExamSessionPhase.IN_PROGRESS)) {

        // cant join anymore, check if user is already in the session
        // in case they are already in, they can still access the session (consulting their answers)
        const alreadyIn = await prisma.userOnExamSession.findUnique({
            where: {
                userEmail_examSessionId: {
                    userEmail: studentEmail,
                    examSessionId: sessionId
                }
            }
        });

        if(!alreadyIn) {
            res.status(400).json({ message: 'Too late' });
            return;
        }
    }

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

    let query = questionsWithIncludes({
        parentResource: 'examSession',
        parentResourceId: sessionId,
        includeTypeSpecific: true
    });

    // add empty answers and gradings for each questions
    const questions = await prisma.question.findMany(query);

    const transaction = [];
    for (const question of questions) {
        transaction.push(
            prisma.studentAnswer.upsert({
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
                        // only code questions have type specific data -> template files
                        create: question.type === QuestionType.code ? {
                            files: {
                                create: question.code.templateFiles.map(codeToFile => ({
                                    studentPermission: codeToFile.studentPermission,
                                    file: {
                                        create: {
                                            path: codeToFile.file.path,
                                            content: codeToFile.file.content,
                                            code: {
                                                connect: {
                                                    questionId: question.id
                                                }
                                            }
                                        }
                                    }
                                }))
                            }
                        } : {}
                    },
                    studentGrading: {
                        create: grading(question, undefined)
                    }
                }
            })
        );

        // run the transaction
        await prisma.$transaction(transaction);
    }

    res.status(200).json(userOnExamSession);
}


export default handler;
