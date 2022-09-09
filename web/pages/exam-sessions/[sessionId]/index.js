import { ExamSessionProvider } from '../../../context/ExamSessionContext';
import PageDraft from '../../../components/exam-session/pages/PageDraft';

const Draft = () => {
   
    return (
        <ExamSessionProvider>
            <PageDraft />
        </ExamSessionProvider>
    )
}

export default Draft;