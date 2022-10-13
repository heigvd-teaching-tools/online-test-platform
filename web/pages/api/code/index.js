import { runSandbox } from "../../../sandbox/runSandbox";
import { hasRole } from '../../../utils/auth';
import {Role} from "@prisma/client";

export default async function handler(req, res) {
    // Student Code test runs concerns the student answer
    let isStudent = await hasRole(req, Role.STUDENT);
    let isProf = await hasRole(req, Role.PROFESSOR);

    if(!(isStudent || isProf)){
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    let { code } = req.body;
    await runSandbox(code).then((reponse) => {
        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}