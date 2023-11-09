import { useRouter } from "next/router"
import useSWR from "swr"
import Authorisation from "../../security/Authorisation"
import { JamSessionPhase, Role } from "@prisma/client"
import Loading from "../../feedback/Loading"
import StudentPhaseRedirect from "./StudentPhaseRedirect"
import LoadingAnimation from "../../feedback/LoadingAnimation"
import { Button, Typography } from "@mui/material"
import { fetcher } from "../../../code/utils"
import {signOut} from "next-auth/react";

const phaseToPhrase = (phase) => {
  switch (phase) {
    case JamSessionPhase.NEW:
    case JamSessionPhase.DRAFT:
      return 'not in progress'
    case JamSessionPhase.IN_PROGRESS:
      return 'in progress'
    case JamSessionPhase.GRADING:
      return 'being graded'
    case JamSessionPhase.FINISHED:
      return 'finished'
    default:
      return 'unknown'
  }
}

const PageWaiting = () => {
  const router = useRouter()
  const jamSessionId = router.query.jamSessionId

  const { data, error } = useSWR(
    `/api/users/jam-sessions/${jamSessionId}/dispatch`,
    jamSessionId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <Loading errors={[error]} loading={!data}>
        {data?.jamSession && (
          <StudentPhaseRedirect phase={data.jamSession.phase}>
            {
              data.jamSession.phase !== JamSessionPhase.IN_PROGRESS && (
                  <LoadingAnimation
                    content={
                      <>
                        <Typography variant="body1" gutterBottom>
                          {data.jamSession.label
                            ? `${data.jamSession.label} is ${phaseToPhrase(
                                data.jamSession.phase
                              )}.`
                            : 'This session is not in progress.'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Please wait until the professor starts the jam.
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
