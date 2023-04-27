import { PrismaClient, Role, QuestionType } from '@prisma/client';
import {getUser, getUserSelectedGroup, hasRole} from '../../../utils/auth';
import {questionIncludeClause} from "../../../code/questions";

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
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const post = async (req, res) => {
    const { label } = req.body;

    const user = await getUser(req);

    try {
        const group = await prisma.group.create({
            data: {
                label,
                createdBy: {
                    connect: {
                        id: user.id
                    }
                },
                members: {
                    create: {
                        userId: user.id,
                    }
                }
            },
        });
        res.status(200).json(group);
    } catch (e) {
        switch(e.code) {
            case 'P2002':
                res.status(409).json({ message: 'Group already exists' });
                break;
            default:
                res.status(500).json({ message: 'Internal server error' });
        }

    }



}

export default handler;
