import { PrismaClient, Role, QuestionType } from '@prisma/client';
import {getUserSelectedGroup, hasRole} from '../../../utils/auth';
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

    const group = await getUserSelectedGroup(req);

    const collections = await prisma.collection.findMany({
        include: {
            collectionToQuestions: {

                orderBy: {
                    order: 'asc'
                }
            }
        },
        where: {
            groupId: group.id
        }
    });
    res.status(200).json(collections);
}

const post = async (req, res) => {
    const { label, description } = req.body;

    const group = await getUserSelectedGroup(req);

    try {
        const collection = await prisma.collection.create({
            data: {
                label,
                description,
                groupId: group.id
            },
        });
        res.status(200).json(collection);
    } catch (e) {
        switch(e.code) {
            case 'P2002':
                res.status(409).json({ message: 'Collection already exists' });
                break;
            default:
                res.status(500).json({ message: 'Internal server error' });
        }

    }



}

export default handler;
