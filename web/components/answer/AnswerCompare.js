import { QuestionType } from '@prisma/client';
import {  Paper } from "@mui/material";
import CompareCode from "./CompareCode";
import ConsultWeb from "./ConsultWeb";
import ConsultEssay from "./ConsultEssay";
import CompareMultipleChoice from "./CompareMultipleChoice";
import CompareTrueFalse from "./CompareTrueFalse";

const AnswerCompare = ({  questionType, solution, answer }) => {
    return (
        <Paper square elevation={0} sx={{ flex:1, height:'100%', overflowX:'auto', p:0 }}>
        {
            answer && (
                questionType === QuestionType.trueFalse && (
                    <CompareTrueFalse
                        mode="compare"
                        solution={solution.isTrue}
                        answer={answer.isTrue}
                    />
                )
                ||
                questionType === QuestionType.multipleChoice && answer.options && (
                    <CompareMultipleChoice
                        mode="compare"
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
                    <CompareCode
                        solution={solution}
                        answer={answer}
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
        </Paper>
    )
}


export default AnswerCompare;
