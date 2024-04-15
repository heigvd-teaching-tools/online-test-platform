
import { useCallback, useState } from 'react'
import BottomCollapsiblePanel from '@/components/layout/utils/BottomCollapsiblePanel'
import CodeCheck from '@/components/question/type_specific/code/codeWriting/CodeCheck'
import FileEditor from '@/components/question/type_specific/code/FileEditor'
import StudentPermissionIcon from '@/components/feedback/StudentPermissionIcon'
import { StudentPermission } from '@prisma/client'

import { useDebouncedCallback } from 'use-debounce'


const AnswerCodeWriting = ({ evaluationId, questionId, answer, onAnswerChange }) => {

    const [lockCodeCheck, setLockCodeCheck] = useState(false)
  
    const onFileChange = useCallback(
      async (file) => {
        setLockCodeCheck(true)
        const response = await fetch(
          `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/code/code-writing/${file.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file }),
          },
        )
        const ok = response.ok
        const data = await response.json()
        setLockCodeCheck(false)
        onAnswerChange && onAnswerChange(ok, data)
      },
      [evaluationId, questionId, onAnswerChange],
    )
  
    const debouncedOnChange = useDebouncedCallback(onFileChange, 500)
  
    return (
        answer?.code && (
          <BottomCollapsiblePanel
            bottomPanel={
              <CodeCheck
                lockCodeCheck={lockCodeCheck}
                codeCheckAction={() =>
                  fetch(
                    `/api/sandbox/evaluations/${evaluationId}/questions/${questionId}/student/code/code-writing`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    },
                  )
                }
              />
            }
          >
            {answer?.code.codeWriting?.files?.map((answerToFile, index) => (
              <FileEditor
                key={index}
                file={answerToFile.file}
                readonlyPath
                readonlyContent={
                  answerToFile.studentPermission === StudentPermission.VIEW
                }
                leftCorner={
                  <StudentPermissionIcon
                    permission={answerToFile.studentPermission}
                  />
                }
                onChange={(file) => {
                  setLockCodeCheck(true)
                  debouncedOnChange(file)
                }}
              />
            ))}
          </BottomCollapsiblePanel>
        )
    )
}

export default AnswerCodeWriting