import { Role, JamSessionPhase } from '@prisma/client'
import { useRouter } from 'next/router'
import Authentication from '../../../security/Authentication'
import Authorisation from '../../../security/Authorisation'
import useSWR from 'swr'
import { useEffect } from 'react'
import { phaseGT, redirectToPhasePage } from '../../../../code/phase'
import { fetcher } from '../../../../code/utils'
import Loading from '../../../feedback/Loading'

const PageDispatch = () => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const { data, error: dispatchError } = useSWR(
    `/api/jam-sessions/${jamSessionId}/dispatch`,
    jamSessionId ? fetcher : null
  )

  useEffect(() => {
    if (data && !dispatchError) {
      const { jamSession, userOnJamSession } = data
      if (!userOnJamSession) {
        // the user is not yet on the jam session
        // check if the current phase of the JamSession allow the user to join
        if (!phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)) {
          ;(async () => {
            await router.push(`/jam-sessions/${jamSessionId}/join`)
          })()
        }
      } else {
        ;(async () => {
          await redirectToPhasePage(jamSessionId, jamSession.phase, router)
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
