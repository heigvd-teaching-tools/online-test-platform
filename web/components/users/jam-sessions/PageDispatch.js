import { Role, JamSessionPhase } from '@prisma/client'
import { useRouter } from 'next/router'
import Authentication from '../../security/Authentication'
import Authorisation from '../../security/Authorisation'
import useSWR from 'swr'
import { useEffect } from 'react'
import { phaseGT, studentPhaseRedirect } from '../../../code/phase'
import { fetcher } from '../../../code/utils'
import Loading from '../../feedback/Loading'

const PageDispatch = () => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const { data, error: dispatchError } = useSWR(
    `/api/users/jam-sessions/${jamSessionId}/dispatch`,
    jamSessionId ? fetcher : null
  )

  useEffect(() => {
    if (data && !dispatchError) {
      const { jamSession, userOnJamSession } = data
      if (!userOnJamSession) {
        // the users is not yet on the jam session
        // check if the current phase of the JamSession allow the users to join
        if (!phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)) {
          ;(async () => {
            await router.push(`/users/jam-sessions/${jamSessionId}/join`)
          })()
        }
      } else {
        ;(async () => {
          await studentPhaseRedirect(jamSessionId, jamSession.phase, router)
        })()
      }
    }
  }, [jamSessionId, router, data, dispatchError])

  return (
    <Authentication>
      <Authorisation allowRoles={[Role.STUDENT, Role.PROFESSOR]}>
        <Loading errors={[dispatchError]} loading={!data} />
      </Authorisation>
    </Authentication>
  )
}

export default PageDispatch