import { ExamSessionProvider } from '../../../context/ExamSessionContext';
import PageScheduling from '../../../components/exam-session/pages/PageScheduling';

const Scheduling = () => {
   
    return (
        <ExamSessionProvider>
            <PageScheduling />
        </ExamSessionProvider>
    )
}

export default Scheduling;