import {JamSessionPhase, PrismaClient} from "@prisma/client";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

export const isInProgress = async (jamSessionId) => {
    // get the questions collections session phase
    if(!jamSessionId) return false;

    const jamSession = await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId
        },
        select: {
            phase: true
        }
    });

    return jamSession.phase === JamSessionPhase.IN_PROGRESS;
}

