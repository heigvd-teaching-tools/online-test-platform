import { PrismaClient, Role } from '@prisma/client';
import { hasRole } from '../../../../code/auth';
import { runSandbox } from "../../../../sandbox/runSandboxTC";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {

    let isProf = await hasRole(req, Role.PROFESSOR);

    if(!isProf){
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
    endpoint to run the sandbox for a question with files from the request body
* */
const post = async (req, res) => {
    const { questionId } = req.query;

    const { files } = req.body;

    const code = await prisma.code.findUnique({
        where: {
            questionId: questionId
        },
        include: {
            sandbox: true,
            testCases: {
                orderBy: {
                    index: 'asc'
                }
            }
        }
    });

    if(!code){
        res.status(404).json({ message: 'Code not found' });
        return;
    }

    const result = await runSandbox({
        image: code.sandbox.image,
        files: files,
        beforeAll: code.sandbox.beforeAll,
        tests: code.testCases
    }).then((result) => {
        res.status(200).send(result);
    });

    res.status(200).send(result);
}
