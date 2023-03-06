import {PrismaClient, Role, StudentFilePermission, CodeToFileNature} from "@prisma/client";

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
        case 'PUT':
            await put(req, res);
            break;
        case 'DELETE':
            await del(req, res);
            break;
        default:
    }
}

const get = async (req, res) => {
    // get the [nature] files for a code question

    const { questionId, nature } = req.query;

    const codeToFileNature = CodeToFileNature[nature.toUpperCase()];

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
    res.status(200).json(files);
}


const post = async (req, res) => {
    // create a new file for a code question
    // as the file is created for a code question we handle it through CodeToFile entity

    const { questionId, nature } = req.query;
    const { path, content } = req.body;

    const codeToFileNature = CodeToFileNature[nature.toUpperCase()];

    const codeToFiles = await prisma.codeToFiles.upsert({
            where: {
                questionId_nature:{
                    questionId,
                    nature: codeToFileNature
                }
            },
            update: {
                files: {
                    create: {
                        path,
                        content,
                    }
                }
            },
            create: {
                nature: codeToFileNature,
                files: {
                    create: {
                        path,
                        content,
                    }
                },
                code: {
                    connect: {
                        questionId: questionId
                    }
                }
            },
            include: {
                files: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
    });

    if(!codeToFiles) res.status(404).json({message: "Not found"});
    res.status(200).json(codeToFiles.files);
}


const put = async (req, res) => {
    // update a file for a code question

    const { questionId, nature } = req.query;
    const { id, path, content, studentPermission } = req.body;

    const codeToFileNature = CodeToFileNature[nature.toUpperCase()];

    const codeToFiles = await prisma.codeToFiles.update({
        where: {
            questionId_nature:{
                questionId,
                nature: codeToFileNature
            }
        },
        data: {
            files: {
                update: {
                    where: {
                        id: id
                    },
                    data: {
                        path,
                        content,
                        studentPermission
                    }
                }
            }
        }
    });
    res.status(200).json(codeToFiles);
}


const del = async (req, res) => {
    // delete a file for a code question

    const { questionId, nature } = req.query;
    const { id } = req.body;

    const codeToFileNature = CodeToFileNature[nature.toUpperCase()];

    const file = await prisma.codeToFiles.update({
        where: {
            questionId_nature:{
                questionId,
                nature: codeToFileNature
            }
        },
        data: {
            files: {
                delete: {
                    id: id
                }
            }
        }
    })

    res.status(200).json(file);
}


export default handler;
