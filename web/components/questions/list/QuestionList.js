import QuestionListItem from "./QuestionListItem";
import {Stack} from "@mui/material";

const QuestionList = ({ questions }) => {
    return(
        <Stack spacing={4}>
            {questions && questions.map((question) => (
                <QuestionListItem
                    key={question.id}
                    question={question}
                />
            ))}
        </Stack>
    )
}

export default QuestionList;
