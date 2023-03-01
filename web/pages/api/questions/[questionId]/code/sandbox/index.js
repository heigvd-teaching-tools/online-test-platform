import {PrismaClient, Role} from "@prisma/client";

import {hasRole} from "../../../../../../utils/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma;

// hanlder for GET, PUT and POST requests

const handler = async (req, res) => {
if(!(await hasRole(req, Role.PROFESSOR))) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    switch(req.method) {
        case 'GET':
            await get(req, res);
        case 'PUT':
            await put(req, res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    // get the sandbox for a code question
    const { questionId } = req.query;
    const sandbox = await prisma.sandBox.findUnique({
        where: {
            questionId: questionId
        }
    });
    if(!sandbox) res.status(404).json({ message: 'Sandbox not found' });
    res.status(200).json(sandbox);
}

const put = async (req, res) => {
    // update a sandbox
    const { questionId } = req.query;

    const { image, beforeAll } = req.body;

    console.log("Save sandbox : ", image, beforeAll);

    const sandbox = await prisma.sandBox.update({
        where: {
            questionId: questionId
        },
        data: {
            image,
            beforeAll
        }
    });

    res.status(200).json(sandbox);
}

const post = async (req, res) => {
    // create a new sandbox
    const { questionId } = req.query;

    const { image, beforeAll } = req.body;

    const sandbox = await prisma.sandBox.create({
        data: {
            image,
            beforeAll,
            questionId: questionId
        }
    });

    res.status(200).json(sandbox);
}

export default handler;
