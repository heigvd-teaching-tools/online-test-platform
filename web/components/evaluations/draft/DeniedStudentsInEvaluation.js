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
import Loading from '@/components/feedback/Loading'
import useSWR from 'swr'
import DeniedStudentList from './DenienStudentList'
import { fetcher } from '@/code/utils'

const STUDENTS_ACTIVE_PULL_INTERVAL = 1000

const DeniedStudentsInEvaluation = ({
  groupScope,
  evaluation,
  onStudentAllowed,
}) => {
  const {
    data: students,
    error: errorStudents,
    mutate,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluation.id}/students/denied`,
    groupScope && evaluation?.id ? fetcher : null,
    { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL },
  )
  return (
    evaluation.id && (
      <Loading loading={!students} errors={[errorStudents]}>
        {students?.userOnEvaluationDeniedAccessAttempt.length > 0 && (
          <DeniedStudentList
            groupScope={groupScope}
            evaluationId={evaluation.id}
            title={`Denied students (${students?.userOnEvaluationDeniedAccessAttempt.length})`}
            students={students?.userOnEvaluationDeniedAccessAttempt}
            onStudentAllowed={(studentEmail) => {
              mutate()
              onStudentAllowed && onStudentAllowed(studentEmail)
            }}
          />
        )}
      </Loading>
    )
  )
}

export default DeniedStudentsInEvaluation
