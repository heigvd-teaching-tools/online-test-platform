import { PrismaClient, Role } from '@prisma/client';
import { hasRole } from '../../../../../utils/auth';
import { runSandbox } from "../../../../../sandbox/runSandbox";

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

    const { questionId } = req.query;  

    const code = await prisma.code.findUnique({
        where: {
            questionId: questionId
        }
    }); 
    
    await runSandbox(code.code, code.solution, "test").then((reponse) => {
        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}