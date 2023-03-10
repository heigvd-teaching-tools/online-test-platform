import {ExamSessionPhase, PrismaClient} from "@prisma/client";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export const isInProgress = async (examSessionId) => {
    // get the questions exam session phase
    if(!examSessionId) return false;

    const examSession = await prisma.examSession.findUnique({
        where: {
            id: examSessionId
        },
        select: {
            phase: true
        }
    });

    return examSession.phase === ExamSessionPhase.IN_PROGRESS;
}

