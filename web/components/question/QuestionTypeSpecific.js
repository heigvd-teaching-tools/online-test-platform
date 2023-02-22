import {QuestionType} from "@prisma/client";
import MultipleChoice from "./type_specific/MultipleChoice";
import { Box, Stack } from "@mui/material";
import Code from "./type_specific/Code";
import TrueFalse from "./type_specific/TrueFalse";
import Web from "./type_specific/Web";

import { ResizeObserverProvider } from "../../context/ResizeObserverContext";

const QuestionTypeSpecific = ({ question, onQuestionChange }) => {
    return (
        <Stack sx={{ height:'100%', overflow:'auto'}}>
            {(
                ( question.type === QuestionType.multipleChoice && question.multipleChoice &&
                    <MultipleChoice
                        options={question.multipleChoice.options}
                        onChange={(newOptions) => onQuestionChange("multipleChoice", { options: newOptions })}
                    />
                )
                ||
                ( question.type === QuestionType.code && question.code &&
                    <Code
                        displaySolutionEditor
                        where="question"
                        rightEditorLabel={{
                            label: "Partial Code",
                            subheader: "Provided to students"
                        }}
                        code={question.code}
                        questionId={question.id}
                        onChange={(which, newCode) => onQuestionChange("code", { [which]: newCode })}
                    />
                )
                ||
                ( question.type === QuestionType.trueFalse && question.trueFalse &&
                    <TrueFalse
                        isTrue={question.trueFalse.isTrue}
                        onChange={(newIsTrue) => onQuestionChange("trueFalse", { isTrue: newIsTrue })}
                    />
                )
                ||
                ( question.type === QuestionType.web && question.web &&
                    <Web
                        web={question.web}
                        onChange={(newWeb) => onQuestionChange("web", newWeb)}
                    />
                )
            )}
        </Stack>
    )
}

export default QuestionTypeSpecific;
