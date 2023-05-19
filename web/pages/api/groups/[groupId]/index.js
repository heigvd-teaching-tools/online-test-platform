import { PrismaClient, Role } from '@prisma/client';
import {getUser, hasRole} from '../../../../code/auth';

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
        case 'DELETE':
            await del(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const del = async (req, res) => {
    // delete a group
    const { groupId } = req.query;

    const user = await getUser(req);

    // check if the user is an owner of the group they are trying to delete
    const userIsOwnerOfGroup = await prisma.group.findFirst({
        where: {
            id: groupId,
            createdBy: {
                id: user.id
            }
        }
    });

    if(!userIsOwnerOfGroup) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    await prisma.group.delete({
        where: {
            id: groupId
        }
    });

    res.status(200).json({ message: 'Group deleted' });
}

export default handler;
