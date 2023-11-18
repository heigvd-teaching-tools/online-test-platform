import useSWR from "swr";
import React, {useCallback, useState} from "react";
import {StudentPermission} from "@prisma/client";
import {useDebouncedCallback} from "use-debounce";

import {fetcher} from "@/code/utils";
import BottomCollapsiblePanel from "@/components/layout/utils/BottomCollapsiblePanel";
import Loading from "@/components/feedback/Loading";
import StudentPermissionIcon from "@/components/feedback/StudentPermissionIcon";

import FileEditor from "@/components/question/type_specific/code/files/FileEditor";
import CodeCheck from "@/components/question/type_specific/code/CodeCheck";

const AnswerCode = ({ evaluationId, questionId, onAnswerChange }) => {

    const { data: answer, error } = useSWR(
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers`,
        questionId ? fetcher : null,
        { revalidateOnFocus: false }
    )

    const [ lockCodeCheck, setLockCodeCheck ] = useState(false)

    const onFileChange = useCallback(
        async (file) => {
            setLockCodeCheck(true)
            const currentFile = answer.code.files.find((f) => f.file.id === file.id)
            if (currentFile.file.content === file.content) return
            const updatedStudentAnswer = await fetch(
                `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/code/${file.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ file }),
                }
            ).then((res) => res.json())
            setLockCodeCheck(false)
            onAnswerChange && onAnswerChange(updatedStudentAnswer)
        },
        [evaluationId, questionId, answer, onAnswerChange]
    )

    const debouncedOnChange = useDebouncedCallback(onFileChange, 500)

    return (
        <Loading errors={[error]} loading={!answer}>
            {answer?.code && (
                <BottomCollapsiblePanel
                    bottomPanel={
                        <CodeCheck
                            lockCodeCheck={lockCodeCheck}
                            codeCheckAction={() =>
                                fetch(
                                    `/api/sandbox/evaluations/${evaluationId}/questions/${questionId}/student/code`,
                                    {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                    }
                                )
                            }
                        />
                    }
                >
                    {answer?.code.files?.map((answerToFile, index) => (
                        <FileEditor
                            key={index}
                            file={answerToFile.file}
                            readonlyPath
                            readonlyContent={
                                answerToFile.studentPermission === StudentPermission.VIEW
                            }
                            leftCorner={
                                <StudentPermissionIcon permission={answerToFile.studentPermission} />
                            }
                            onChange={(file) => {
                                setLockCodeCheck(true)
                                debouncedOnChange(file)
                            }}
                        />
                    ))}
            </BottomCollapsiblePanel>
            )}

        </Loading>
    )
}


export default AnswerCode
