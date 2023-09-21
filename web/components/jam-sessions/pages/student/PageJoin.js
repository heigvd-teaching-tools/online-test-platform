import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import LoadingAnimation from '../../../feedback/LoadingAnimation'
import { redirectToPhasePage } from '../../../../code/phase'
/*
 *    Used as entry point for students
 *    Sends a join request to the server and redirects to the waiting page
 *  */
const PageJoin = () => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const { data: session, status } = useSession()
  const [error, setError] = useState(null)
  useEffect(() => {
    /*
     * student is joining the jam session (it must be in draft or in-progress phase)
     * */
    setError(null)
    if (jamSessionId && session && status === 'authenticated') {
      ;(async () => {
        await fetch(`/api/jam-sessions/${jamSessionId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            studentEmail: session.user.email,
          }),
        })
          .then(async (res) => {
            let data
            try {
              data = await res.json()
            } catch (e) {
              data.message = 'Server error'
            }
            if (!res.ok) {
              throw new Error(data.message)
            }
            return data
          })
          .then(async (data) => {
            setError(null)
            const phase = data?.jamSession.phase
            ;(async () => {
              redirectToPhasePage(jamSessionId, phase, router)
            })()
          })
          .catch((err) => {
            setError(err.message)
          })
      })()
    }
  }, [jamSessionId, router, session, status])

  return <LoadingAnimation content={error || 'joining...'} failed={error} />
}

export default PageJoin
