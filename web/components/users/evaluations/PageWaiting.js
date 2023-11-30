import { useRouter } from "next/router"
import useSWR from "swr"
import Authorisation from "../../security/Authorisation"
import { EvaluationPhase, Role } from "@prisma/client"
import Loading from "../../feedback/Loading"
import StudentPhaseRedirect from "./StudentPhaseRedirect"
import LoadingAnimation from "../../feedback/LoadingAnimation"
import { Button, Typography } from "@mui/material"
import { fetcher } from "../../../code/utils"
import {signOut} from "next-auth/react";

const phaseToPhrase = (phase) => {
  switch (phase) {
    case EvaluationPhase.NEW:
    case EvaluationPhase.DRAFT:
      return 'not in progress'
    case EvaluationPhase.IN_PROGRESS:
      return 'in progress'
    case EvaluationPhase.GRADING:
      return 'being graded'
    case EvaluationPhase.FINISHED:
      return 'finished'
    default:
      return 'unknown'
  }
}

const PageWaiting = () => {
  const router = useRouter()
  const evaluationId = router.query.evaluationId

  const { data, error } = useSWR(
    `/api/users/evaluations/${evaluationId}/dispatch`,
    evaluationId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <Loading errors={[error]} loading={!data}>
        {data?.evaluation && (
          <StudentPhaseRedirect phase={data.evaluation.phase}>
            {
              data.evaluation.phase !== EvaluationPhase.IN_PROGRESS && (
                  <LoadingAnimation
                    content={
                      <>
                        <Typography variant="body1" gutterBottom>
                          {data.evaluation.label
                            ? `${data.evaluation.label} is ${phaseToPhrase(
                                data.evaluation.phase
                              )}.`
                            : 'This session is not in progress.'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {
                            data.evaluation.phase === EvaluationPhase.GRADING
                              ? 'Please wait until the professor finishes grading.'
                              : 'Please wait until the professor starts the evaluation.'
                          }
                        </Typography>
                        <Button onClick={() => signOut()}>Sign out</Button>
                      </>
                    }
                  />
              )}
            </StudentPhaseRedirect>
        )}
      </Loading>
    </Authorisation>
  )
}

export default PageWaiting
