import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Role } from '@prisma/client'

import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'
import { fetcher } from '@/code/utils'

import PhaseRedirect from './PhaseRedirect'

const PageIndex = () => {
  const router = useRouter()
  const { groupScope, jamSessionId } = router.query

  const {
    data: jamSession,
    error,
  } = useSWR(
      `/api/${groupScope}/jam-sessions/${jamSessionId}`,
      groupScope && jamSessionId ? fetcher : null
      )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!jamSession} errors={[error]}>
        <PhaseRedirect phase={jamSession?.phase} />
      </Loading>
    </Authorisation>
  )
}

export default PageIndex
