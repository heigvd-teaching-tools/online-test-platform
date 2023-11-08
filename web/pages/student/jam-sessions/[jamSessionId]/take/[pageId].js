import { Suspense } from 'react'
import PageTakeJam from '../../../../../components/student/jam-sessions/PageTakeJam'

const TakeJamSession = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageTakeJam />
        </Suspense>
    )
}

export default TakeJamSession
