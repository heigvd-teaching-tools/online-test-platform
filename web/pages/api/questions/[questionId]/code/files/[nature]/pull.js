import {PrismaClient, Role, StudentFilePermission, CodeToFileNature} from "@prisma/client";

import {hasRole} from "../../../../../../../utils/auth";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma;

// hanlder for POST

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
    // copy solution files to template files

    const { questionId, nature } = req.query;

    const codeToFileNature = CodeToFileNature[nature.toUpperCase()];

    if(codeToFileNature !== CodeToFileNature.SOLUTION) {
        res.status(400).json({message: "Bad request"});
        return;
    }

    const codeToFiles = await prisma.codeToFiles.findMany({
        where: {
            questionId,
            nature: codeToFileNature
        },
        include: {
            files: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if(!codeToFiles) res.status(404).json({message: "Not found"});

    let files = [];
    if(codeToFiles.length > 0) {
        files = codeToFiles[0].files;
    }

    // delete any existing template files
    await prisma.codeToFiles.deleteMany({
        where: {
            questionId,
            nature: CodeToFileNature.TEMPLATE
        }
    });

    // create new template files
    const newCodeToFiles = await prisma.codeToFiles.create({
        data: {
            questionId,
            nature: CodeToFileNature.TEMPLATE,
            files: {
                create: files.map(file => {
                    return {
                        path: file.path,
                        content: file.content
                    }
                })
            }
        }
    });

    res.status(200).json(newCodeToFiles.files || []);
}

export default handler;
