import { PrismaClient, Role } from '@prisma/client';

import { hasRole } from '../../../../utils/auth';
import { runSandbox } from "../../../../sandbox/runSandbox";


if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {

    let isProfOrStudent = await hasRole(req, Role.PROFESSOR) || await hasRole(req, Role.STUDENT);

    if(!isProfOrStudent) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    let { code } = req.body;

    const { questionId } = req.query;

    const solution = await prisma.code.findUnique({
        where: {
            questionId: questionId
        }
    });

    await runSandbox(code, solution.solution, "test").then((reponse) => {
        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}