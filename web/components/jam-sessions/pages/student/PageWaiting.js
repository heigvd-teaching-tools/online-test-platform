import { useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { JamSessionPhase, Role } from '@prisma/client'

import LoadingAnimation from '../../../feedback/LoadingAnimation'
import { Button, Typography } from '@mui/material'
import Authorisation from '../../../security/Authorisation'
import StudentPhaseRedirect from './StudentPhaseRedirect'
import { fetcher } from '../../../../code/utils'
import Loading from '../../../feedback/Loading'

const phaseToPhrase = (phase) => {
  switch (phase) {
    case JamSessionPhase.NEW:
    case JamSessionPhase.DRAFT:
      return 'not in progress'
    case JamSessionPhase.IN_PROGRESS:
      return 'in progress'
    case JamSessionPhase.GRADING:
      return 'being graded'
    case JamSessionPhase.FINISHED:
      return 'finished'
    default:
      return 'unknown'
  }
}

const PageWaiting = () => {
  const router = useRouter()
  const jamSessionId = router.query.jamSessionId

  const { data, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/dispatch`,
    jamSessionId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  useEffect(() => {
    if (
      data?.jamSession &&
      data.jamSession.phase === JamSessionPhase.IN_PROGRESS
    ) {
      ;(async () => {
        await router.push(`/jam-sessions/${jamSessionId}/take/1`)
      })()
    }
  }, [data, router, jamSessionId])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <Loading errors={[error]} loading={!data}>
        {data?.jamSession &&
          data.jamSession.phase !== JamSessionPhase.IN_PROGRESS && (
            <StudentPhaseRedirect phase={data.jamSession.phase}>
              <LoadingAnimation
                content={
                  <>
                    <Typography variant="body1" gutterBottom>
                      {data.jamSession.label
                        ? `${data.jamSession.label} is ${phaseToPhrase(
                            data.jamSession.phase
                          )}.`
                        : 'This session is not in progress.'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Please wait until the professor starts the jam.
                    </Typography>
                    <Button onClick={() => signOut()}>Sign out</Button>
                  </>
                }
              />
            </StudentPhaseRedirect>
          )}
      </Loading>
    </Authorisation>
  )
}

export default PageWaiting
