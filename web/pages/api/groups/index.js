import { PrismaClient, Role } from '@prisma/client';
import {getUser, hasRole} from '../../../code/auth';

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
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const post = async (req, res) => {
    // create a new group
    const { label, select } = req.body;

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

        if(select) {
            await prisma.userOnGroup.upsert({
                where: {
                    userId_groupId: {
                        userId: user.id,
                        groupId: group.id
                    }
                },
                update: {
                    selected: true
                },
                create: {
                    selected: true,
                }
            });
        }

        res.status(200).json(group);
    } catch (e) {
        switch(e.code) {
            case 'P2002':
                res.status(409).json({ message: 'A group with that label already exists' });
                break;
            default:
                res.status(500).json({ message: 'Internal server error' });
        }

    }
}

export default handler;
