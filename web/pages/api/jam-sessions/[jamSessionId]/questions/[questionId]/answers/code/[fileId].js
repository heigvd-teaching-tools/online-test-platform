import { PrismaClient, Role, StudentAnswerStatus } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hasRole } from '../../../../../../../../utils/auth';
import {isInProgress} from "../utils";
import { grading } from '../../../../../../../../code/grading';

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
    const { jamSessionId, questionId, fileId } = req.query;

    const { file } = req.body;

    if(!await isInProgress(jamSessionId)) {
        res.status(400).json({ message: 'Exam session is not in progress' });
        return;
    }

    const jamSessionToQuestion = await prisma.jamSessionToQuestion.findUnique({
        where: {
            jamSessionId_questionId: {
                jamSessionId: jamSessionId,
                questionId: questionId
            }
        },
        include: {
            question: true
        }
    });

    if(!jamSessionToQuestion) {
        res.status(400).json({ message: 'Question not found' });
        return;
    }

    // get all the files of the student answers
    const studentAnswerFiles = await prisma.studentAnswerCodeToFile.findMany({
        where: {
            userEmail: studentEmail,
            questionId: questionId
        },
        select: {
            file: true
        }
    });

    // get original code question templateFiles
    const originalFiles = await prisma.codeToTemplateFile.findMany({
        where: {
            questionId: questionId
        },
        select: {
            file: true
        }
    });

    // deciding whatever the answer if submitted or missing
    // find any difference between the original files and the student answers files
    // to find the corresponding file use the "path" property and then compare the "content" property
    const diffFiles = studentAnswerFiles.filter(studentAnswerFile => {
        const originalFile = originalFiles.find(originalFile => originalFile.file.path === studentAnswerFile.file.path);
        if(originalFile.file.path === file.path){
            return originalFile.file.content !== file.content;
        }
        return originalFile.file.content !== studentAnswerFile.file.content;
    });

    const status = diffFiles.length === 0 ? StudentAnswerStatus.MISSING : StudentAnswerStatus.SUBMITTED;

    const transaction = []; // to do in single transaction, queries are done in order

    // update the status of the student answers
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

    // update the student answers file for code question
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

    // grade question
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
                ...grading(jamSessionToQuestion, undefined)

            },
            update: grading(jamSessionToQuestion, undefined)
        })
    );

    // prisma transaction
    await prisma.$transaction(transaction);

    const updatedAnswer = await prisma.studentAnswer.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        select:{
            status: true,
            code: {
                select: {
                    files: {
                        select: {
                            file: true
                        }
                    }
                }
            }
        }
    });

    res.status(200).json(updatedAnswer);
}

export default handler;
