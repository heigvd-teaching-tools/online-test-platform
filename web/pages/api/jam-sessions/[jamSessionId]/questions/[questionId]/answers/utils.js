import {JamSessionPhase, PrismaClient} from "@prisma/client";

if (!global.prisma) {
    global.prisma = new PrismaClient()
}

const prisma = global.prisma

const selectJamSession = async (jamSessionId) => {
    if(!jamSessionId) return null;
    return await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId
        },
        select: {
            phase: true
        }
    });
}

export const isInProgress = async (jamSessionId) => {
    // get the questions collections session phase
    if(!jamSessionId) return false;

    const jamSession = await selectJamSession(jamSessionId);
    return jamSession?.phase === JamSessionPhase.IN_PROGRESS;
}

export const isFinished = async (jamSessionId) => {
    // get the questions collections session phase
    if(!jamSessionId) return false;
    const jamSession = await selectJamSession(jamSessionId);
    return jamSession?.phase === JamSessionPhase.FINISHED;
}

