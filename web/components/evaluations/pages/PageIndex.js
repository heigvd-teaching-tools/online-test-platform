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
import useSWR from 'swr'
import { Role } from '@prisma/client'

import Authorization from '@/components/security/Authorization'
import Loading from '@/components/feedback/Loading'
import { fetcher } from '@/code/utils'

import PhaseRedirect from './PhaseRedirect'

const PageIndex = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { data: evaluation, error } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
  )

  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!evaluation} errors={[error]}>
        <PhaseRedirect phase={evaluation?.phase} />
      </Loading>
    </Authorization>
  )
}

export default PageIndex
