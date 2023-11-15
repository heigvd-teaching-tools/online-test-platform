import { Role, EvaluationPhase } from '@prisma/client'
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
  const { evaluationId } = router.query

  const { data, error: dispatchError } = useSWR(
    `/api/users/evaluations/${evaluationId}/dispatch`,
    evaluationId ? fetcher : null
  )

  useEffect(() => {
    if (data && !dispatchError) {
      const { evaluation, userOnEvaluation } = data
      if (!userOnEvaluation) {
        // the users is not yet on the evaluation
        // check if the current phase of the Evaluation allow the users to join
        if (!phaseGT(evaluation.phase, EvaluationPhase.IN_PROGRESS)) {
          ;(async () => {
            await router.push(`/users/evaluations/${evaluationId}/join`)
          })()
        }
      } else {
        ;(async () => {
          await studentPhaseRedirect(evaluationId, evaluation.phase, router)
        })()
      }
    }
  }, [evaluationId, router, data, dispatchError])

  return (
    <Authentication>
      <Authorisation allowRoles={[Role.STUDENT, Role.PROFESSOR]}>
        <Loading errors={[dispatchError]} loading={!data} />
      </Authorisation>
    </Authentication>
  )
}

export default PageDispatch
