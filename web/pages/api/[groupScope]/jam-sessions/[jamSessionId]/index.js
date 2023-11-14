import { JamSessionPhase, Role } from '@prisma/client';
import { withPrisma } from '@/middleware/withPrisma';
import {withAuthorization, withGroupScope, withMethodHandler} from '@/middleware/withAuthorization';

const get = async (req, res, prisma) => {
  const { jamSessionId } = req.query
  const jamSession = await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
  })

  res.status(200).json(jamSession)
};

const patch = async (req, res, prisma) => {
  const { jamSessionId } = req.query

  const currentJamSession = await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
    select: {
      phase: true,
      startAt: true,
      durationHours: true,
      durationMins: true,
    },
  })

  if (!currentJamSession) {
    res.status(404).json({ message: 'Jam session not found' })
    return
  }

  const {
    phase: nextPhase,
    label,
    conditions,
    duration,
    endAt,
    status,
  } = req.body

  let data = {}

  if (nextPhase) {
    data.phase = nextPhase
    if (nextPhase === JamSessionPhase.IN_PROGRESS) {
      // handle start and end time
      let durationHours = currentJamSession.durationHours
      let durationMins = currentJamSession.durationMins
      if (durationHours > 0 || durationMins > 0) {
        data.startAt = new Date()
        data.endAt = new Date(
          Date.now() + durationHours * 3600000 + durationMins * 60000
        )
      } else {
        data.startAt = null
        data.endAt = null
      }
    }
  }

  if (label) {
    data.label = label
  }

  if (conditions) {
    data.conditions = conditions
  }

  if (status) {
    data.status = status
  }

  if (duration) {
    data.durationHours = duration.hours
    data.durationMins = duration.minutes
  }

  if (endAt) {
    let startAt = new Date(currentJamSession.startAt)
    let newEndAt = new Date(endAt)
    if (newEndAt < startAt) {
      res.status(400).json({ message: 'End time must be after start time' })
      return
    }
    data.endAt = endAt
  }

  try {
    const jamSessionAfterUpdate = await prisma.jamSession.update({
      where: {
        id: jamSessionId,
      },
      data: data,
    })
    res.status(200).json(jamSessionAfterUpdate)
  } catch (e) {
    switch (e.code) {
      case 'P2002':
        res.status(409).json({ message: 'Jam session label already exists' })
        break
      default:
        res.status(500).json({ message: 'Error while updating jam session' })
        break
    }
  }
}

const del = async (req, res, prisma) => {
  const { groupScope, jamSessionId } = req.query

  /*
        get all the questions related to this jam session
        It is not possible to cascade delete the questions because we passed bv and an intermediate relation
     */
  const jstqs = await prisma.jamSessionToQuestion.findMany({
    where: {
      jamSessionId: jamSessionId,
    },
  })

  const questionIds = jstqs.map((jstq) => jstq.questionId)

  await prisma.$transaction(async (prisma) => {
    // delete all the questions related to this jam session
    await prisma.question.deleteMany({
      where: {
        id: {
          in: questionIds,
        },
        group: {
            scope: groupScope
        }
      },
    })
    await prisma.jamSession.delete({
      where: {
        id: jamSessionId,
      },
    })
  })

  res.status(200).json({ message: 'Jam session deleted' })
};


export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  PATCH: withAuthorization(
      withGroupScope(withPrisma(patch)), [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
      withGroupScope(withPrisma(del)), [Role.PROFESSOR]
  ),
});