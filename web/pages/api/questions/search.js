import { PrismaClient, Role, QuestionType } from '@prisma/client';
import { hasRole } from '../../../utils/auth';
import {questionsWithIncludes} from "../../../code/questions";

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
    }
}

const get = async (req, res) => {
    // search for questions
    // title=test&content=test&questionTypes=multipleChoice%2CtrueFalse%2Cessay%2Ccode%2Cweb&codeLanguages=cpp%2Cjava%2Cpython%2Cjavascript

    let { title, content, questionTypes, codeLanguages } = req.query;
    questionTypes = questionTypes ? questionTypes.split(',').map(type => QuestionType[type]) : [];

    codeLanguages = codeLanguages ? codeLanguages.split(',') : [];

    const query = questionsWithIncludes({
        includeTypeSpecific: true,
        includeOfficialAnswers: true
    });

    let where = {
        where: {
            OR: [
                {
                    title: {
                        contains: title
                    }
                },{
                    content: {
                        contains: content
                    }
                },{
                    type:  {
                        in: questionTypes
                    }
                }
            ]
        }
    }
    if(questionTypes.includes(QuestionType.code)) {
        where.where.OR.push({
            code: {
                language: {
                    in: codeLanguages
                }
            }
        })
    }

    const questions = await prisma.question.findMany({
        ...query,
        ...where
    });

    res.status(200).json(questions);



}

export default handler;
