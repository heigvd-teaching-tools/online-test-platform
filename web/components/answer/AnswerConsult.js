import { QuestionType } from '@prisma/client';
import {Paper, Stack} from "@mui/material";
import CompareMultipleChoice from "./CompareMultipleChoice";
import ConsultEssay from "./ConsultEssay";
import ConsultWeb from "./ConsultWeb";
import ConsultCode from "./ConsultCode";
import CompareTrueFalse from "./CompareTrueFalse";

const AnswerConsult = ({ id, questionType, solution, answer }) => {
    return (
        <Stack height="100%" overflow="auto">
        {
            answer && (
                questionType === QuestionType.trueFalse && (
                    <CompareTrueFalse
                        mode="consult"
                        solution={solution.isTrue}
                        answer={answer.isTrue}
                    />
                )
                ||
                questionType === QuestionType.multipleChoice && answer.options && (
                    <CompareMultipleChoice
                        id={id}
                        mode="consult"
                        solution={solution.options}
                        answer={answer.options}
                    />
                )
                ||
                questionType === QuestionType.essay && (
                    <ConsultEssay
                        content={answer.content}
                    />
                )
                ||
                questionType === QuestionType.code && (
                    <ConsultCode
                        files={answer.files}
                        tests={answer.testCaseResults}
                    />
                )
                ||
                questionType === QuestionType.web && (
                    <ConsultWeb
                        answer={answer}
                    />
                )
            )
        }
        </Stack>
    )
}

export default AnswerConsult;
