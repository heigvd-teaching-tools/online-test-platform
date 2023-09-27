import { Suspense } from 'react'
import PageTakeJam from '../../../../components/jam-sessions/pages/student/PageTakeJam'

const TakeJamSession = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <PageTakeJam />
        </Suspense>
    )
}

export default TakeJamSession
