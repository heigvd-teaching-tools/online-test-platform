import Loading from '@/components/feedback/Loading'
import useSWR from 'swr'
import DenienStudentList from './DenienStudentList'
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
          <DenienStudentList
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
