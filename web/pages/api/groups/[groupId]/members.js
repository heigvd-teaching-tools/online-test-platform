import { PrismaClient, Role } from '@prisma/client';
import { hasRole, getUser } from '../../../../utils/auth';
import {questionIncludeClause} from "../../../../code/questions";

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
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const get = async (req, res) => {
    // get all members of group
    const { groupId } = req.query;

    // check if the user is a member of the group they are trying to get members of
    const user = await getUser(req);

    if(!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userIsMemberOfGroup = await prisma.group.findFirst({
        where: {
            id: groupId,
            members: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    if(!userIsMemberOfGroup) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const members = await prisma.group.findUnique({
        where: {
            id: groupId
        },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    res.status(200).json(members);
}

const post = async (req, res) => {
    // add member to group
    const { groupId } = req.query;
    const { member } = req.body;

    // check if the user is a member of the group they are trying to add a member to
    const requester = await getUser(req);



    if(!requester) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }



    const requesterIsMemberOfGroup = await prisma.group.findFirst({
        where: {
            id: groupId,
            members: {
                some: {
                    userId: requester.id
                }
            }
        }
    });

    if(!requesterIsMemberOfGroup) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try{
        const membership = await prisma.userOnGroup.create({
            data: {
                userId: member.id,
                groupId
            },
            select: {
                user: true
            }
        });

        res.status(200).json(membership);
    } catch(e) {
        switch(e.code) {
            case 'P2002':
                res.status(409).json({ message: 'Member already exists' });
                break;
            default:
                res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default handler;
