import {PrismaClient, Role} from "@prisma/client";

import {hasRole} from "../../../../../code/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma;

// handler for PUT, POST, DELETE and GET requests

const handler = async (req, res) => {
    if(!(await hasRole(req, Role.PROFESSOR))) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    switch(req.method) {
        case 'PUT':
            await put(req, res);
            break;
        case 'POST':
            await post(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        case 'GET':
            await get(req, res);
            break;
        default:
    }
}

// update the option of the multichoice question
const put = async (req, res) => {

    const { questionId } = req.query;
    const { option } = req.body;

    // check if options belongs to the question
    const optionQuestion = await prisma.multipleChoice.findUnique({
        where: { questionId: questionId },
        include: {
            options: true
        }
    });

    if(!optionQuestion.options.some(o => o.id === option.id)) {
        res.status(404).json({ message: 'Option not found' });
        return;
    }

    // update the option
    const updatedOption = await prisma.option.update({
        where: { id: option.id },
        data: {
            text: option.text,
            isCorrect: option.isCorrect
        }
    });

    res.status(200).json(updatedOption);

}

// create a new option for the multichoice question
const post = async (req, res) => {

    const { questionId } = req.query;
    const { option } = req.body;

   // create the option
    const newOption = await prisma.option.create({
        data: {
            text: option.text,
            isCorrect: option.isCorrect,
            multipleChoice: {
                connect: {
                    questionId: questionId
                }
            }
        }
    });

    res.status(200).json(newOption);

}

const del = async (req, res) => {

        const { questionId } = req.query;
        const { option } = req.body;

        // check if options belongs to the question
        const optionQuestion = await prisma.multipleChoice.findUnique({
            where: {
                questionId: questionId
            },
            include: {
                options: true
            }
        });

        if(!optionQuestion.options.some(o => o.id === option.id)) {
            res.status(404).json({ message: 'Option not found' });
            return;
        }

        // delete the option
        await prisma.option.delete({
            where: {
                id: option.id
            }
        });

        res.status(200).json({ message: 'Option deleted' });
}

// get the options of the multichoice question
const get = async (req, res) => {

    const { questionId } = req.query;

    const multiChoice = await prisma.multipleChoice.findUnique({
        where: {
            questionId: questionId
        },
        include: {
            options: {
                orderBy: {
                    id: 'asc'
                }
            }
        }
    });

    res.status(200).json(multiChoice.options);

}
export default handler;
