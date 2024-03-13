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
import { useRouter } from 'next/router'
import { EvaluationPhase } from '@prisma/client'

const phasePageRelationship = {
  NEW: '/[groupScope]/evaluations/new',
  DRAFT: '/[groupScope]/evaluations/[evaluationId]/draft',
  IN_PROGRESS: '/[groupScope]/evaluations/[evaluationId]/in-progress',
  GRADING: '/[groupScope]/evaluations/[evaluationId]/grading/[activeQuestion]',
  FINISHED: '/[groupScope]/evaluations/[evaluationId]/finished',
}

const redirectToPhasePage = (phase, router) => {
  const { groupScope, evaluationId } = router.query
  if (router.pathname === phasePageRelationship[phase]) return
  switch (phase) {
    case EvaluationPhase.NEW:
      router.push(`/${groupScope}/evaluations/new`)
      return
    case EvaluationPhase.DRAFT:
      router.push(`/${groupScope}/evaluations/${evaluationId}/draft`)
      return
    case EvaluationPhase.IN_PROGRESS:
      router.push(`/${groupScope}/evaluations/${evaluationId}/in-progress`)
      return
    case EvaluationPhase.GRADING:
      router.push(`/${groupScope}/evaluations/${evaluationId}/grading/1`)
      return
    case EvaluationPhase.FINISHED:
      router.push(`/${groupScope}/evaluations/${evaluationId}/finished`)
      return
  }
}

const PhaseRedirect = ({ phase, children }) => {
  const router = useRouter()
  redirectToPhasePage(phase, router)

  return children
}

export default PhaseRedirect
