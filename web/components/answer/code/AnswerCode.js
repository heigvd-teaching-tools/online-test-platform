/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import useSWR from 'swr'
import React, { useCallback, useEffect, useState } from 'react'
import { CodeQuestionType, StudentPermission } from '@prisma/client'
import { useDebouncedCallback } from 'use-debounce'

import { fetcher } from '@/code/utils'
import BottomCollapsiblePanel from '@/components/layout/utils/BottomCollapsiblePanel'
import Loading from '@/components/feedback/Loading'
import StudentPermissionIcon from '@/components/feedback/StudentPermissionIcon'

import FileEditor from '@/components/question/type_specific/code/FileEditor'
import CodeCheck from '@/components/question/type_specific/code/codeWriting/CodeCheck'

const AnswerCode = ({ evaluationId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers`,
    questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )
  return (
    <Loading errors={[error]} loading={!answer}>
      {
        answer?.code?.codeType === CodeQuestionType.codeWriting && (
          <AnswerCodeWriting
            evaluationId={evaluationId}
            questionId={questionId}
            answer={answer}
            onAnswerChange={onAnswerChange}
          />
        )
      }
      {
        answer?.code?.codeType === CodeQuestionType.codeReading && (
          <AnswerCodeReading
            evaluationId={evaluationId}
            questionId={questionId}
            answer={answer}
            onAnswerChange={onAnswerChange}
          />
        )
      }
    </Loading>
  )
}


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


import { TextField, Box, Stack, InputAdornment } from '@mui/material';
import InlineMonacoEditor from '@/components/input/InlineMonacoEditor'
import StatusDisplay from '@/components/feedback/StatusDisplay'

const AnswerCodeReading = ({ evaluationId, questionId, answer, onAnswerChange }) => {

  const [lockCodeReadingCheck, setLockCodeReadingCheck] = useState(false);

  const onOutputChange = useCallback(
    async (snippetId, newOutput) => {
      console.log("onOutputChange", snippetId, newOutput)
      setLockCodeReadingCheck(true);
      const response = await fetch(
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/code/code-reading/${snippetId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ output: newOutput }),
        },
      );
      const ok = response.ok;
      const data = await response.json();
      setLockCodeReadingCheck(false);
      onAnswerChange && onAnswerChange(ok, data);
    },
    [evaluationId, questionId, onAnswerChange],
  );

  const debouncedOnOutputChange = useDebouncedCallback(onOutputChange, 500);

  return (
    <Stack spacing={0} pt={2} > 
      {answer?.code?.codeReading?.outputs?.map((output, index) => (
        <AnswerCodeReadingOutput
          key={index}
          snippet={output.codeReadingSnippet.snippet}
          output={output.output}
          onOutputChange={(newOutput) => {
            debouncedOnOutputChange(output.codeReadingSnippet.id, newOutput);
          }}
        />
      ))}
    </Stack>
  );
};

const AnswerCodeReadingOutput = ({ snippet, output:initial, onOutputChange }) => {

  const [ output, setOutput ] = useState(initial);

  useEffect(() => {
    setOutput(initial);
  }, [initial]);

  return (
    <Box>
      <InlineMonacoEditor
        readOnly
        language="cpp"
        minHeight={30}
        code={snippet}
      />
      <Box p={1}>
        <TextField
          variant="standard"
          label="Guess the output"
          fullWidth
          multiline
          value={output || ''}
          onChange={(e) => {
            setOutput(e.target.value)
            onOutputChange(e.target.value)
          }}
          placeholder='...'
          helperText="Supports multiple lines. Careful with whitespaces."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <StatusDisplay status={"NEUTRAL"} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

    </Box>
  );
}

export default AnswerCode
