import { PrismaClient, Role } from '@prisma/client';
import { hasRole } from '../../../../code/auth';
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
        case 'PUT':
            await put(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}


const get = async (req, res) => {
    const { collectionId } = req.query

    const collectionWithQuestions = await prisma.collection.findUnique({
        where: {
            id: collectionId
        },
        include: {
            collectionToQuestions: {
                include: {
                    question: {
                        include: questionIncludeClause({
                            includeTypeSpecific: true,
                            includeOfficialAnswers: true,
                        })
                    }
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });
    res.status(200).json(collectionWithQuestions);
}

const put = async (req, res) => {
    const { collectionId } = req.query
    const { collection } = req.body;

    const updated = await prisma.collection.update({
        where: {
            id: collectionId
        },
        data: {
            label: collection.label
        }
    });

    res.status(200).json(updated);
}

const del = async (req, res) => {
    const { collectionId } = req.query
    const collection = await prisma.collection.delete({
        where: {
            id: collectionId
        }
    });
    res.status(200).json(collection);
}

export default handler;
