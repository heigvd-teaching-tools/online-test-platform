import { PrismaClient, Role } from '@prisma/client';
import { hasRole } from '../../../../utils/auth';
import { runSandbox } from "../../../../sandbox/runSandboxTC";
import {getSession} from "next-auth/react";
import {grading} from "../../../../code/grading";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {

    const isProf = await hasRole(req, Role.PROFESSOR);
    const IsStudent = await hasRole(req, Role.STUDENT);


    if(!(isProf || IsStudent)){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    switch (req.method) {
        case 'POST':
            await post(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }

}

/*
 endpoint to run the sandbox for a student answer to a code question with files from the database
 */
const post = async (req, res) => {
    const session = await getSession({ req });

    const { questionId } = req.query;
    const studentEmail = session.user.email;

    const code = await prisma.code.findUnique({
        where: {
            questionId: questionId
        },
        include: {
            sandbox: true,
            testCases: true
        }
    });

    if(!code){
        res.status(404).json({ message: 'Code not found' });
        return;
    }

    const studentAnswerCodeFiles = await prisma.studentAnswerCode.findUnique({
        where: {
            userEmail_questionId: {
                userEmail: studentEmail,
                questionId: questionId
            }
        },
        include: {
            files: {
                include: {
                    file: true
                }
            }
        }
    });

    if(!studentAnswerCodeFiles || !studentAnswerCodeFiles.files){
        res.status(404).json({ message: 'Student files not found' });
        return;
    }

    const files = studentAnswerCodeFiles.files.map((codeToFile) => codeToFile.file);

    const response = await runSandbox({
        image: code.sandbox.image,
        files: files,
        beforeAll: code.sandbox.beforeAll,
        tests: code.testCases
    }).then(async (response) => {

        /*

        RESULT :  {
          beforeAll: undefined,
          tests: [
            {
              exec: 'python /src/script.py',
              input: 'Hello World1',
              output: 'HELLO WORLD1',
              expectedOutput: 'HELLO WORLD1',
              passed: true
            }
          ]
        }

        * */

        await prisma.StudentAnswerCode.update({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            data: {
                allTestCasesPassed: response.tests.every((test) => test.passed),
                testCaseResults: {
                    deleteMany: {},
                    create: response.tests.map((test, index) => ({
                            index: index + 1,
                            exec: test.exec,
                            input: test.input,
                            output: test.output,
                            expectedOutput: test.expectedOutput,
                            passed: test.passed
                        }))
                    }
                }
        });

        const question = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                code: true
            }
        });

        // code questions grading
        await prisma.studentQuestionGrading.upsert({
            where: {
                userEmail_questionId: {
                    userEmail: studentEmail,
                    questionId: questionId
                }
            },
            update: grading(question, response),
            create: {
                userEmail: studentEmail,
                questionId: questionId,
                ...grading(question, response)
            }
        });

        res.status(200).send(response);
    });

    res.status(200).send(response);
}
