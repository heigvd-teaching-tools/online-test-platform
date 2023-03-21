import { PrismaClient, Role, ExamSessionPhase, QuestionType } from '@prisma/client';
import { hasRole } from '../../../utils/auth';
import { questionsWithIncludes } from '../../../code/questions';

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
            await get(res);
            break;
        case 'POST':
            await post(req, res);
            break;
        default:
    }
}

const get = async (res) => {
    const exams = await prisma.examSession.findMany({
        include: {
            questions: true,
            students: true
        },
    });
    res.status(200).json(exams);
}

const post = async (req, res) => {
    const { label, conditions, duration, examId } = req.body;

    const questions = await prisma.question.findMany(
        questionsWithIncludes({
            parentResource: 'exam',
            parentResourceId: examId,
            includeTypeSpecific: true,
            includeOfficialAnswers: true
        })
    );

    if(!questions || questions && questions.length === 0){
        res.status(400).json({ message: 'You exam session has no questions. Please select the reference exam.' });
        return;
    }

    if(label.length === 0){
        res.status(400).json({ message: 'You exam session has no label. Please enter a label.' });
        return;
    }

    let data = {
        phase: ExamSessionPhase.DRAFT,
        label,
        conditions,
        questions: {
            // do all except code questions
            create: questions.filter(q => q.type !== QuestionType.code).map(question => ({
                content: question.content,
                type: question.type,
                points: parseInt(question.points),
                order: parseInt(question.order),
                [question.type]: {
                    create: questionTypeSpecific(question)
                }
            }))
        }
    }

    if(duration){
        data.durationHours = parseInt(duration.hours);
        data.durationMins = parseInt(duration.minutes);
    }
    try {
        const examSession = await prisma.examSession.create({ data });

        // create the copy of code questions for the exam session
        const codeQuestionsToCreate = questions.filter(q => q.type === QuestionType.code);

        for (const question of codeQuestionsToCreate) {
            // create code questions, without files
            const newCodeQuestion = await prisma.question.create({
                data: {
                    examSession: {
                        connect: {
                            id: examSession.id
                        }
                    },
                    content: question.content,
                    points: parseInt(question.points),
                    order: parseInt(question.order),
                    type: QuestionType.code,
                    code: {
                        create: {
                            language: question.code.language,
                            sandbox: {
                                create: {
                                    image: question.code.sandbox.image,
                                    beforeAll: question.code.sandbox.beforeAll
                                }
                            },
                            testCases: {
                                create: question.code.testCases.map(testCase => ({
                                    index: testCase.index,
                                    exec: testCase.exec,
                                    input: testCase.input,
                                    expectedOutput: testCase.expectedOutput
                                }))
                            }
                        }
                    }
                }
            });

            // create the copy of template and solution files and link them to the new code questions
            for(const codeToFile of question.code.templateFiles){

                const newFile = await prisma.file.create({
                    data: {
                        path: codeToFile.file.path,
                        content: codeToFile.file.content,
                        createdAt: codeToFile.file.createdAt, // for deterministic ordering
                        code: {
                            connect: {
                                questionId: newCodeQuestion.id
                            }
                        }
                    }
                });
                await prisma.codeToTemplateFile.create({
                    data: {
                        questionId: newCodeQuestion.id,
                        fileId: newFile.id,
                        studentPermission: codeToFile.studentPermission
                    }
                });
            }

            for(const codeToFile of question.code.solutionFiles){
                const newFile = await prisma.file.create({
                    data: {
                        path: codeToFile.file.path,
                        content: codeToFile.file.content,
                        createdAt: codeToFile.file.createdAt, // for deterministic ordering
                        code: {
                            connect: {
                                questionId: newCodeQuestion.id
                            }
                        }
                    }
                });
                await prisma.codeToSolutionFile.create({
                    data: {
                        questionId: newCodeQuestion.id,
                        fileId: newFile.id,
                    }
                });
        }
        }
        res.status(200).json(examSession);
    } catch (e) {
        switch(e.code){
            case 'P2002':
                res.status(409).json({ message: 'Exam session label already exists' });
                break;
            default:
                console.log("error", e);
                res.status(500).json({ message: 'Error while updating exam session' });
                break;
        }
    }
}

const questionTypeSpecific = (question) => {
    switch(question.type) {
        case QuestionType.trueFalse:
            return {
                isTrue: question.trueFalse.isTrue
            }
        case QuestionType.essay:
            return {
                content: question.essay.content
            }
        case QuestionType.web:
            return {
                html: question.web.html,
                css: question.web.css,
                js: question.web.js
            }
        case QuestionType.multipleChoice:
            return {
                options: {
                    create: question.multipleChoice.options.map(option => ({
                        text: option.text,
                        isCorrect: option.isCorrect
                    }))
                }
            }
        default:
            return {}
    }
}


export default handler;
