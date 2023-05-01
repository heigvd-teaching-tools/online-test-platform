import { PrismaClient, Role, QuestionType, JamSessionPhase } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../utils/auth';
import { grading } from '../../../../code/grading';
import { phaseGT } from "../../../../code/phase";

import {questionIncludeClause, questionsWithIncludes} from '../../../../code/questions';

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
    const { jamSessionId } = req.query;
    const session = await getSession({ req });
    const studentEmail = session.user.email;

    const jamSession = await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId
        }
    });

    if(!jamSession) {
        res.status(404).json({ message: 'Not found' });
        return;
    }

    if(phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)) {

        // cant join anymore, check if user is already in the session
        // in case they are already in, they can still access the session (consulting their answers)
        const alreadyIn = await prisma.userOnJamSession.findUnique({
            where: {
                userEmail_jamSessionId: {
                    userEmail: studentEmail,
                    jamSessionId: jamSessionId
                }
            }
        });

        if(!alreadyIn) {
            res.status(400).json({ message: 'Too late' });
            return;
        }
    }

    const userOnJamSession = await prisma.userOnJamSession.upsert({
        where: {
            userEmail_jamSessionId: {
                userEmail: studentEmail,
                jamSessionId: jamSessionId
            }
        },
        update: {},
        create: {
            userEmail: studentEmail,
            jamSessionId: jamSessionId
        }
    });

    const jamSessionToQuestions = await prisma.jamSessionToQuestion.findMany({
        where:{
            jamSessionId: jamSessionId
        },
        include: {
            question: {
                include: questionIncludeClause(true, false)
            }
        },
        orderBy: {
            order: 'asc'
        }
    });

    const questions = jamSessionToQuestions.map(jamSessionToQuestion => jamSessionToQuestion.question);

    // add empty answers and gradings for each questions
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
                                create: question.code.templateFiles.map(codeToFile => {
                                    return ({
                                        studentPermission: codeToFile.studentPermission,
                                        file: {
                                            create: {
                                                path: codeToFile.file.path,
                                                content: codeToFile.file.content,
                                                createdAt: codeToFile.file.createdAt,
                                                code: {
                                                    connect: {
                                                        questionId: question.id
                                                    }
                                                }
                                            }
                                        }
                                    })
                                })
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

    res.status(200).json(userOnJamSession);
}


export default handler;
