import { useRouter } from "next/router";
import { Tabs, Tab } from "@mui/material";
import FilledBullet from '../../feedback/FilledBullet';

const QuestionPages = ({ questions, activeQuestion, link, isFilled }) => {
    const router = useRouter();
    return (
        <Tabs
            value={questions.map(({id}) => id).indexOf(activeQuestion?.id || 0)}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(e, index) => router.push(link(questions[index].id, index))}
        >
            {questions.map(({id, order}, index) => (
                <Tab
                    key={id}
                    label={`Q${order + 1}`}
                    iconPosition="start"
                    sx={{ minHeight: '50px', minWidth: 0 }}
                    value={index}
                    icon={
                        isFilled && <FilledBullet
                            index={index}
                            isFilled={() => isFilled && isFilled(id)}
                        />
                    }
                />
            ))}
        </Tabs>
    )
};


export default QuestionPages;
