import {QuestionType} from "@prisma/client";
import { Stack } from "@mui/material";
import ManageMultipleChoice from "./type_specific/ManageMultipleChoice";
import Code from "./type_specific/Code";
import TrueFalse from "./type_specific/TrueFalse";
import Web from "./type_specific/Web";

const QuestionTypeSpecific = ({ question, onQuestionChange }) => {
    console.log("QuestionTypeSpecific", question)
    return (
        <Stack height="100%" overflow="auto">
            {(
                ( question.type === QuestionType.multipleChoice &&
                    <ManageMultipleChoice
                        questionId={question.id}
                    />
                )
                ||
                ( question.type === QuestionType.code &&
                    <Code
                        questionId={question.id}
                    />
                )
                ||
                ( question.type === QuestionType.trueFalse && question.trueFalse &&
                    <TrueFalse
                        isTrue={question.trueFalse.isTrue}
                        onChange={(newIsTrue) => onQuestionChange({ trueFalse: { isTrue: newIsTrue }})}
                    />
                )
                ||
                ( question.type === QuestionType.web && question.web &&
                    <Web
                        web={question.web}
                        onChange={(newWeb) => onQuestionChange({ web: newWeb })}
                    />
                )
            )}
        </Stack>
    )
}

export default QuestionTypeSpecific;
