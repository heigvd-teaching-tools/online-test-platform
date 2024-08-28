import StudentAttendanceGrid from "../evaluation/phases/attendance/StudentAttendanceGrid"

const StudentsInEvaluation = ({
  groupScope,
  evaluationId,
  students,
  restrictedAccess,
  accessList,
  onStudentAllowed,
}) => {
  
  return (
    evaluationId && (
        <StudentAttendanceGrid
            groupScope={groupScope}
            evaluationId={evaluationId}
            students={students}
            restrictedAccess={restrictedAccess}
            accessList={accessList}
            onStudentAllowed={() => {
                onStudentAllowed()
            }}
        />
    )
  )
}

export default StudentsInEvaluation