import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Role } from '@prisma/client'


import PhaseRedirect from './PhaseRedirect'
import Authorisation from '../../security/Authorisation'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'

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
