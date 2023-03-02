import {CodeToFileNature, PrismaClient, Role, StudentFilePermission} from "@prisma/client";

import {hasRole} from "../../../../../../../utils/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma;

// hanlder for POST, GET

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
    // get the solution files for a code question

    const { questionId } = req.query;

    const code = await prisma.code.findUnique({
        where: {
            questionId: questionId
        },
        select: {
            codeToFiles: {
                where: {
                    nature: CodeToFileNature.TEMPLATE
                },
                include: {
                    files: true
                }
            },
        },
    });
    if(!code) res.status(404).json({message: "Not found"});
    console.log("template/index", code);
    let files = [];
    if(code.codeToFiles.length > 0) {
        files = code.codeToFiles[0].files;
    }
    res.status(200).json(files);
}

const post = async (req, res) => {
    // create a new file for a code question

    const { questionId } = req.query;
    const { path, content } = req.body;

    const file = await prisma.code.update({
        where: {
            questionId: questionId
        },
        data: {
            templateFiles: {
                create: {
                    path: path,
                    content: content
                }
            }
        }
    });
    res.status(200).json(file);
}




export default handler;
