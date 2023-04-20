import {PrismaClient, Role, StudentFilePermission} from "@prisma/client";

import {hasRole} from "../../../../../utils/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma;

// handler for PUT, POST and GET requests

const handler = async (req, res) => {
    if(!(await hasRole(req, Role.PROFESSOR))) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    switch(req.method) {
        case 'PUT':
            await put(req, res);
            break;
        case 'GET':
            await get(req, res);
            break;
        default:
    }
}

const put = async (req, res) => {
    // code only carries "language" field. The rest of the fields are in the sub-entities

    const { questionId } = req.query;
    const { language, sandbox, testCases, files } = req.body;

    const codeQuestion = await prisma.code.create(codeCreateQuery(questionId, language, sandbox, testCases, files));

    res.status(200).json(codeQuestion);
}

const get = async (req, res) => {
    // get the code of the question

    const { questionId } = req.query;
    const codeQuestion = await prisma.code.findUnique({
        where: {
            questionId: questionId
        }
    });

    res.status(200).json(codeQuestion);
}


const codeCreateQuery = (questionId, language, sandbox, testCases, files) => {

    return {
        data: {
            language,
            sandbox: {
                create: {
                    image: sandbox.image,
                    beforeAll: sandbox.beforeAll
                }
            },
            testCases: {
                create: testCases.map((testCase, index) => ({
                    index: index + 1,
                    exec: testCase.exec,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput
                }))
            },
            solutionFiles: {
                create: files.solution.map((file) => ({
                    file: {
                        create: {
                            path: file.path,
                            content: file.content,
                            code: {
                                connect: {
                                    questionId: questionId
                                }
                            }
                        }
                    }
                }))
            },
            templateFiles: {
                create: files.template.map((file) => ({
                    studentPermission: StudentFilePermission.UPDATE,
                    file: {
                        create: {
                            path: file.path,
                            content: file.content,
                            code: {
                                connect: {
                                    questionId: questionId
                                }
                            }
                        }
                    }
                }))
            },
            question: {
                connect: {
                    id: questionId
                }
            }
        }
    }
}

export default handler;
