import { fetcher } from "@/code/utils"
import Loading from "@/components/feedback/Loading"
import useSWR from "swr"
import StudentList from "./StudentList"
import { Card, CardContent } from "@mui/material"

const STUDENTS_ACTIVE_PULL_INTERVAL = 1000

const StudentsInEvaluation = ({
  groupScope,
  evaluation,
  restrictedAccess,
  accessList,
  onStudentAllowed,
}) => {
  const {
    data: students,
    error: errorStudents,
    mutate,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluation.id}/students`,
    groupScope && evaluation?.id ? fetcher : null,
    { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL },
  )

  return (
    evaluation.id && (
      <Loading loading={!students} errors={[errorStudents]}>
        <StudentList
            groupScope={groupScope}
            evaluationId={evaluation.id}
            students={students?.students}
            restrictedAccess={restrictedAccess}
            accessList={accessList}
            onStudentAllowed={() => {
                onStudentAllowed()
                mutate()
            }}
        />
      </Loading>
    )
  )
}

export default StudentsInEvaluation