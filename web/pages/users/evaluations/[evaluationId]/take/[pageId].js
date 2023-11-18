import { Suspense } from 'react'
import PageTakeEvaluation from '@/components/users/evaluations/PageTakeEvaluation'

const TakeEvaluation = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageTakeEvaluation />
        </Suspense>
    )
}

export default TakeEvaluation
