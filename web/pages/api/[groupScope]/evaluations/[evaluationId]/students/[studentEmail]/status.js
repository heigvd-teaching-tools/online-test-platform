import { Role, UserOnEvaluationStatus } from "@prisma/client";

import { withAuthorization, withGroupScope, withMethodHandler } from "@/middleware/withAuthorization";
import { withPrisma } from "@/middleware/withPrisma";

// update the status of a student in an evaluation
const put = async (req, res, prisma) => {

    const { evaluationId, studentEmail } = req.query;

    const { status } = req.body;

    const userOnEvaluationStatus = Object.values(UserOnEvaluationStatus);

    if (!userOnEvaluationStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const evaluation = await prisma.evaluation.findUnique({
        where: {
            id: evaluationId,
        }
    });

    if (!evaluation) {
        return res.status(404).json({ message: 'Evaluation not found' });
    }

    const student = await prisma.userOnEvaluation.findUnique({
        where: {
            userEmail_evaluationId: {
                userEmail: studentEmail,
                evaluationId,
            }
        }
    });

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await prisma.userOnEvaluation.update({
        where: {
            userEmail_evaluationId: {
                userEmail: studentEmail,
                evaluationId,
            }
        },
        data: {
            status,
            finishedAt: status === UserOnEvaluationStatus.FINISHED ? new Date() : null,
        }
    });

    res.status(200).json(updatedStudent);
}


export default withMethodHandler({
    PUT: withAuthorization(
        withGroupScope(withPrisma(put)), [Role.PROFESSOR]
    ),
});