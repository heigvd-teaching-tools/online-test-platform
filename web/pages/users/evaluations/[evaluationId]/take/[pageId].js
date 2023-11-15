import { Suspense } from 'react'
import PageTakeevaluation from '../../../../../components/users/evaluation/PageTakeEvaluation'

const TakeEvaluation = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageTakeevaluation />
        </Suspense>
    )
}

export default TakeEvaluation
