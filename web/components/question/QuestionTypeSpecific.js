import Column from "../layout/utils/Column";
import {QuestionType} from "@prisma/client";
import MultipleChoice from "./type_specific/MultipleChoice";
import {Stack} from "@mui/material";
import Code from "./type_specific/Code";
import TrueFalse from "./type_specific/TrueFalse";
import Web from "./type_specific/Web";
import Row from "../layout/utils/Row";

const QuestionTypeSpecific = ({ question, onQuestionChange }) => {

    return (
        <Row>
            <Column flexGrow={1}>
                {(
                    ( question.type === QuestionType.multipleChoice && question.multipleChoice &&
                        <MultipleChoice
                            options={question.multipleChoice.options}
                            onChange={(newOptions) => onQuestionChange("multipleChoice", { options: newOptions })}
                        />
                    )
                    ||
                    ( question.type === QuestionType.code && question.code &&
                        <Stack spacing={2}>
                            <Code
                                containerHeight='600'
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
                        </Stack>
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
                            containerHeight='400'
                            web={question.web}
                            onChange={(newWeb) => onQuestionChange("web", newWeb)}
                        />
                    )

                )}
            </Column>
        </Row>
    )
}

export default QuestionTypeSpecific;
