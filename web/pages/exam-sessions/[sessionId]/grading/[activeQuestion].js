import { ExamSessionProvider } from '../../../../context/ExamSessionContext';
import PageGrading from '../../../../components/exam-session/pages/PageGrading';

const Grading = () =>  
<ExamSessionProvider>
    <PageGrading />
</ExamSessionProvider>

export default Grading;