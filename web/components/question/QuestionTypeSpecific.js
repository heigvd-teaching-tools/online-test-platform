import {QuestionType} from "@prisma/client";
import { Stack } from "@mui/material";
import UpdateCode from "./type_specific/UpdateCode";
import TrueFalse from "./type_specific/TrueFalse";
import Web from "./type_specific/Web";

import UpdateMultipleChoice from "./type_specific/UpdateMultipleChoice";

const QuestionTypeSpecific = ({ question, onQuestionChange }) => {


    return (
        <Stack height="100%" overflow="auto">
            {(
                ( question.type === QuestionType.multipleChoice &&
                    <UpdateMultipleChoice
                        questionId={question.id}
                    />
                )
                ||
                ( question.type === QuestionType.code &&
                    <UpdateCode
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
