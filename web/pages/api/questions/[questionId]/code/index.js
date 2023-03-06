import {PrismaClient, Role, CodeToFileNature, StudentFilePermission} from "@prisma/client";

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
        case 'POST':
            await post(req, res);
            break;
        case 'GET':
            await get(req, res);
            break;
        default:
    }
}

const put = async (req, res) => {
    // code only carries "language" field. The rest of the fields are in the sub-entities
    // the change of language will delete the sub-entities and create new ones

    const { questionId } = req.query;
    const { language, sandbox, testCases, files } = req.body;

    // files must be deleted manually because of the relation between code and file
    const filesToDelete = await prisma.file.findMany({
        where: {
            fileToCode: {
                is: {
                    questionId: questionId
                }
            }
        }
    });

    // delete the files
    await prisma.file.deleteMany({
        where: {
            id: {
                in: filesToDelete.map(file => file.id)
            }
        }
    });

    // delete then create the code
    await prisma.code.delete({
        where: { questionId: questionId }
    });

    const codeQuestion = await prisma.code.create(codeCreateQuery(questionId, language, sandbox, testCases, files));

    res.status(200).json(codeQuestion);
}

const post = async (req, res) => {
    // create a code and its sub-entities

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

    const filesQuery = [
        ...files.solution.map(file => ({
            nature: CodeToFileNature.SOLUTION,
            file: {
                create: {
                    path: file.path,
                    content: file.content
                }
            }
        })),
        ...files.template.map(file => ({
            nature: CodeToFileNature.TEMPLATE,
            file: {
                create: {
                    path: file.path,
                    content: file.content
                }
            }
        }))
    ]
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
            codeToFiles: {
                create: filesQuery
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
