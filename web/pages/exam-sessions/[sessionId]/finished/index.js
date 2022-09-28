import { ExamSessionProvider } from '../../../../context/ExamSessionContext';
import PageFinished from '../../../../components/exam-session/pages/PageFinished';

const Grading = () =>  
<ExamSessionProvider>
    <PageFinished />
</ExamSessionProvider>

export default Grading;