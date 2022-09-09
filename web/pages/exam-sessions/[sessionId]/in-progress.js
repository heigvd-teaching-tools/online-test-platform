import { ExamSessionProvider } from '../../../context/ExamSessionContext';
import PageInProgress from '../../../components/exam-session/pages/PageInProgress';

const InProgress = () => {
   
    return (
        <ExamSessionProvider>
            <PageInProgress />
        </ExamSessionProvider>
    )
}

export default InProgress;