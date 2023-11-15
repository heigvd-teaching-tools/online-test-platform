import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Role } from '@prisma/client'

import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'
import { fetcher } from '@/code/utils'

import PhaseRedirect from './PhaseRedirect'

const PageIndex = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const {
    data: evaluation,
    error,
  } = useSWR(
      `/api/${groupScope}/evaluation/${evaluationId}`,
      groupScope && evaluationId ? fetcher : null
      )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!evaluation} errors={[error]}>
        <PhaseRedirect phase={evaluation?.phase} />
      </Loading>
    </Authorisation>
  )
}

export default PageIndex
