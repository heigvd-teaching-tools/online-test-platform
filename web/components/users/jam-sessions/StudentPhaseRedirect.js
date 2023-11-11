import { useRouter } from 'next/router'
import {
  phasePageRelationship,
  studentPhaseRedirect,
} from '../../../code/phase'
/*
    Checks if the current pathname corresponds to the expected pathname for the current phase.
    If not, redirects to the expected pathname.
    If yes, renders the children.
*/
const StudentPhaseRedirect = ({ phase, children }) => {
  const router = useRouter()

  if (router.pathname !== phasePageRelationship[phase]) {
    // the pathname is not the expected one, we redirect
    const jamSessionId = router.query.jamSessionId
    ;(async () => {
      await studentPhaseRedirect(jamSessionId, phase, router)
    })()
    return null
  }
  return children
}

export default StudentPhaseRedirect
