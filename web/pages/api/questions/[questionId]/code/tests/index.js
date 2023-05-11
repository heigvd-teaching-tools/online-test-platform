import {PrismaClient, Role} from "@prisma/client";

import {hasRole} from "../../../../../../code/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma


const handler = async (req, res) => {

    if(!(await hasRole(req, Role.PROFESSOR))) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    switch(req.method) {
        case 'GET':
            await get(req, res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    // get the list of test cases for a code question
    const { questionId } = req.query;
    const testCases = await prisma.testCase.findMany({
        where: {
            questionId: questionId
        },
        orderBy: {
            index: 'asc'
        }
    });
    if(!testCases) res.status(404).json({ message: 'Test cases not found' });
    res.status(200).json(testCases);
}

const post = async (req, res) => {
    // create a new test case for a code question
    const { questionId } = req.query;
    const { exec, input, expectedOutput } = req.body;

    const count = await prisma.testCase.count({
        where: {
            questionId: questionId,
        }
    });

    const testCase = await prisma.testCase.create({
        data: {
            index: count + 1,
            exec,
            input,
            expectedOutput,
            questionId: questionId
        }
    });
    res.status(200).json(testCase);
}

export default handler
