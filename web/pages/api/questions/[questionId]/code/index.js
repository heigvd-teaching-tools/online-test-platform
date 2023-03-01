import {PrismaClient, Role} from "@prisma/client";

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
    // update the code of the question

    const { questionId } = req.query;
    const { language } = req.body;
    const codeQuestion = await prisma.code.update({
        where: {
            questionId: questionId
        },
        data: {
            language
        }
    });

    res.status(200).json(codeQuestion);
}

const post = async (req, res) => {
    // create a code and its sub-entities

    const { questionId } = req.query;
    const { language, sandbox } = req.body;
    const codeQuestion = await prisma.code.create({
        data: {
            language,
            questionId: questionId,
            sandbox: {
                create: {
                    image: sandbox.image,
                    beforeAll: sandbox.beforeAll
                }
            }
        }
    });

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

export default handler;
