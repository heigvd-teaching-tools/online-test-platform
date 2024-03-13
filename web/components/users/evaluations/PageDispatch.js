/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
