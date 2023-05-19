import {PrismaClient, Role } from '@prisma/client';
import {getUserSelectedGroup, hasRole} from '../../../code/auth';

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
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

const get = async (req, res) => {
    const group = await getUserSelectedGroup(req);

    if(!group) {
        res.status(404).json({ message: 'Group not found' });
        return;
    }

    // get all tags for this group
    const tags = await prisma.tag.findMany({
        where: {
            groupId: group.id
        }
    });

    res.status(200).json(tags);
}

export default handler;
