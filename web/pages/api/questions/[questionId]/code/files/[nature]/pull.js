import {PrismaClient, Role, StudentFilePermission } from "@prisma/client";

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

    if(nature !== "solution") {
        res.status(400).json({message: "Bad request"});
        return;
    }

    const codeToFiles = await prisma.codeToSolutionFile.findMany({
        where: {
            questionId
        },
        include: {
            file: true
        }
    });

    if(!codeToFiles) res.status(404).json({message: "Not found"});

    let files = codeToFiles.map(codeToFile => codeToFile.file);

    // delete any existing template files
    await prisma.codeToTemplateFile.deleteMany({
        where: {
            questionId
        }
    });

    const newCodeToFiles = [];
    // create new template files
    for( const file of files) {
        let newCodeToFile =  await prisma.codeToTemplateFile.create({
            data: {
                studentPermission: StudentFilePermission.UPDATE,
                file: {
                    create: {
                        path: file.path,
                        content: file.content,
                        code: {
                            connect: { questionId }
                        }
                    }
                },
                code: {
                    connect: {
                        questionId
                    }
                }
            },
            include: {
                file: true
            }
        });
        newCodeToFiles.push(newCodeToFile);

    }

    res.status(200).json(newCodeToFiles || []);
}

export default handler;
