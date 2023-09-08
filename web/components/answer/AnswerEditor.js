import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react'
import useSWR from 'swr'
import { QuestionType, StudentPermission, DatabaseQueryOutputTest } from '@prisma/client'

import TrueFalse from '../question/type_specific/TrueFalse'
import MultipleChoice from '../question/type_specific/MultipleChoice'
import Essay from '../question/type_specific/Essay'
import Web from '../question/type_specific/Web'
import {AlertTitle, Box, Breadcrumbs, Button, Chip, Stack, Typography} from '@mui/material'
import FileEditor from '../question/type_specific/code/files/FileEditor'
import Image from 'next/image'
import CodeCheck from '../question/type_specific/code/CodeCheck'

import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/router'
import Loading from '../feedback/Loading'
import { fetcher } from '../../code/utils'
import QueryEditor from "../question/type_specific/database/QueryEditor";
import QueryOutput from "../question/type_specific/database/QueryOutput";
import ScrollContainer from "../layout/ScrollContainer";
import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import BottomPanel from "../layout/utils/BottomPanel";
import AlertFeedback from "../feedback/AlertFeedback";

import { grey } from '@mui/material/colors';
import {LoadingButton} from "@mui/lab";

const AnswerEditor = ({ question, onAnswer }) => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const onAnswerChange = useCallback(
    (updatedStudentAnswer) => {
      if (onAnswer) {
        onAnswer(question, updatedStudentAnswer)
      }
    },
    [question, onAnswer]
  )
  return (
    question &&
    ((question.type === QuestionType.trueFalse && (
      <AnswerTrueFalse
        jamSessionId={jamSessionId}
        questionId={question.id}
        onAnswerChange={onAnswerChange}
      />
    )) ||
      (question.type === QuestionType.multipleChoice && (
        <AnswerMultipleChoice
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.essay && (
        <AnswerEssay
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.code && (
        <AnswerCode
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.web && (
        <AnswerWeb
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      ))) ||
    (question.type === QuestionType.database && (
        <AnswerDatabase
            jamSessionId={jamSessionId}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
        />
        ))
    )
}

const queryOutputTestToName = {
    [DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER]: "Ignore column order",
    [DatabaseQueryOutputTest.IGNORE_ROW_ORDER]: "Ignore row order",
    [DatabaseQueryOutputTest.IGNORE_EXTRA_COLUMNS]: "Ignore extra columns",
    [DatabaseQueryOutputTest.INGORE_COLUMN_TYPES]: "Ignore types",
}

const AnswerDatabase = ({ jamSessionId, questionId, onAnswerChange }) => {
    const { data: answer, error } = useSWR(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        questionId ? fetcher : null
    )

    const ref = useRef()

    const [ saveLock, setSaveLock ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ queries, setQueries ] = useState()
    const [ studentOutputs, setStudentOutputs ] = useState()

    useEffect(() => {
        if(!answer) return
        const studentQueries = answer.queries;
        setQueries(studentQueries.map((q) => q.query))
        setStudentOutputs(studentQueries.map((q) => q.studentOutput))
    }, [answer]);

    const solutionOutputs = useMemo(() => answer?.solutionOutputs, [answer]);
    const getSolutionOutput = useCallback((order) => solutionOutputs.find(q => q.order === order), [solutionOutputs])

    const saveAndTest = useCallback(async () => {
        setSaving(true);
        setStudentOutputs(queries.map((q, index) => ({
            ...studentOutputs[index],
            output:{
                ...studentOutputs[index]?.output,
                result: null,
                status: "RUNNING",
                testPassed: null,
            }
        })) || []);
       const response = await fetch(`/api/sandbox/jam-sessions/${jamSessionId}/questions/${questionId}/student/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
       }).then(res => res.json());
       setStudentOutputs(response);
       setSaving(false);
    }, [jamSessionId, questionId, queries, studentOutputs]);

    const onQueryChange = useCallback(
        async (query) => {
            const updatedStudentAnswer = await fetch(
                `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers/database/${query.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: query.content }),
                }
            ).then((res) => res.json());
            setSaveLock(false);
            onAnswerChange && onAnswerChange(updatedStudentAnswer)
        },
        [jamSessionId, questionId, answer, onAnswerChange]
    )

    const debouncedOnChange = useDebouncedCallback(onQueryChange, 500)
    const handleChange = (query) => {
        setSaveLock(true);
        debouncedOnChange(query);
    }

    const hasTestPassed = (studentOutput) => {
        return studentOutput?.output.testPassed;
    }
    const getTestColor = (studentOutput) => {
        if(!studentOutput) return "info";
        const testPassed = hasTestPassed(studentOutput);
        if(testPassed === null) return "info";
        return testPassed ? "success" : "error";
    }
    const getTestFeedback = (order, studentOutput) => {
        const testPassed = hasTestPassed(studentOutput);
        if(testPassed === null) return "Running test...";
        return testPassed ? `Test for query #${order} passed!` : `Test for query #${order} failed!`;
    }

    return (
        <Loading errors={[error]} loading={!answer}>
            {answer?.queries && (
                <>
                <Stack
                    position={'relative'}
                    height={'100%'}
                    overflow={'hidden'}
                    p={1}
                    pb={'52px'}
                >
                    <ScrollContainer ref={ref}>
                        {queries?.map((query, index) => (
                            <Stack key={query.id}>
                            <StudentQueryEditor

                                query={query}
                                onChange={(query) => handleChange(query)}
                            />
                            { query.testQuery && studentOutputs[index] && (
                                <AlertFeedback severity={getTestColor(studentOutputs[index])}>
                                    <AlertTitle>
                                        {getTestFeedback(query.order, studentOutputs[index])}
                                    </AlertTitle>
                                    {query.queryOutputTests.length > 0 && (
                                        <Breadcrumbs separator="-" aria-label="breadcrumb">
                                            { query.queryOutputTests.map(({test}) => (
                                                <Typography variant={"caption"}>{queryOutputTestToName[test]}</Typography>
                                            ))}
                                        </Breadcrumbs>
                                    )}
                                </AlertFeedback>
                            )}
                            <StudentOutputVizualisation
                                color={getTestColor(studentOutputs[index])}
                                testQuery={query.testQuery}
                                studentOutput={studentOutputs[index]}
                                solutionOutput={getSolutionOutput(query.order)}
                            />
                            </Stack>
                        ))}
                    </ScrollContainer>
                    <BottomPanel
                        header={
                            <Stack p={1}>
                                <LoadingButton
                                    loading={saving}
                                    disabled={saveLock}
                                    variant={"contained"}
                                    onClick={() => saveAndTest()}
                                >
                                    Save and test
                                </LoadingButton>
                            </Stack>
                        }
                    />
                </Stack>
                </>
            )}
        </Loading>
    )
}

const StudentQueryEditor = ({ query:initial, onChange }) => {

    const [ query, setQuery ] = useState(initial);

    useEffect(() => setQuery(initial), [initial.id])

    return (
        <Stack>
            <QueryEditor
                order={query.order}
                key={query.id}
                readOnly={query.studentPermission !== StudentPermission.UPDATE}
                hidden={query.studentPermission === StudentPermission.HIDDEN}
                query={query}
                onChange={(q) => {
                    setQuery(q)
                    onChange && onChange(q)
                }}
            />
        </Stack>
    )
}

const StudentOutputVizualisation = ({ color, testQuery, studentOutput, solutionOutput}) => {

    const [ height, setHeight ] = useState(0);

    const [ leftHeight, setLeftHeight ] = useState(0);
    const [ rightHeight, setRightHeight ] = useState(0);

    useEffect(() => setHeight(Math.max(leftHeight, rightHeight)), [leftHeight, rightHeight]);

    return (
        testQuery ? (
            <LayoutSplitScreen
                useScrollContainer={false}
                height={`${height}px`}
                leftPanel={
                    <QueryOutput
                        header={
                            <Typography variant={"caption"}>
                                Your output
                            </Typography>
                        }
                        color={color}
                        showAgo
                        queryOutput={studentOutput}
                        onHeightChange={(newHeight) => {
                            setLeftHeight(newHeight);
                        }}
                    />
                }
                rightWidth={50}
                rightPanel={
                    <QueryOutput
                        header={
                            <Typography variant={"caption"}>
                                Expected output
                            </Typography>
                        }
                        color={color}
                        queryOutput={solutionOutput}
                        onHeightChange={(newHeight) => {
                            setRightHeight(newHeight)
                        }}
                    />
                }
            />
        ) : (
            <QueryOutput
                queryOutput={studentOutput}
                color={"info"}
            />
        )
    )
}

const AnswerCode = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

    const ref = useRef()

  const onFileChange = useCallback(
    async (file) => {
      const currentFile = answer.code.files.find((f) => f.file.id === file.id)
      if (currentFile.file.content === file.content) return
      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers/code/${file.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, answer, onAnswerChange]
  )

  const debouncedOnChange = useDebouncedCallback(onFileChange, 500)

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.code && (
          <Stack
              position={'relative'}
              height={'100%'}
              overflow={'hidden'}
              p={1}
              pb={'50px'}
          >
              <ScrollContainer ref={ref}>
                {answer.code.files?.map((answerToFile, index) => (
                  <FileEditor
                    key={index}
                    file={answerToFile.file}
                    readonlyPath
                    readonlyContent={
                      answerToFile.studentPermission === StudentPermission.VIEW
                    }
                    secondaryActions={
                      (answerToFile.studentPermission ===
                          StudentPermission.VIEW && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Image
                            alt='viewable icon'
                            src="/svg/icons/viewable.svg"
                            width={24}
                            height={24}
                          />
                          <Typography variant="caption">view</Typography>
                        </Stack>
                      )) ||
                      (answerToFile.studentPermission ===
                          StudentPermission.UPDATE && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Image
                            alt='editable icon'
                            src="/svg/icons/editable.svg"
                            width={24}
                            height={24}
                          />
                          <Typography variant="caption">edit</Typography>
                        </Stack>
                      ))
                    }
                    onChange={debouncedOnChange}
                  />
                ))}
              </ScrollContainer>

              <CodeCheck
                  codeCheckAction={() =>
                      fetch(
                          `/api/sandbox/jam-sessions/${jamSessionId}/questions/${questionId}/student/code`,
                          {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                          }
                      )
                  }
              />
          </Stack>

      )}
    </Loading>
  )
}

const AnswerMultipleChoice = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    jamSessionId && questionId ? fetcher : null
  )

  const [options, setOptions] = useState(undefined)

  useEffect(() => {
    if (answer?.question.multipleChoice.options && answer) {
      // merge the options with the student answers

      let allOptions = answer.question.multipleChoice.options
      let studentOptions = answer.multipleChoice?.options

      setOptions(
        allOptions.map((option) => {
          return {
            ...option,
            isCorrect:
              studentOptions &&
              studentOptions.some(
                (studentOption) => studentOption.id === option.id
              ),
          }
        })
      )
    }
  }, [answer])

  const onOptionChange = useCallback(
    async (index, options) => {
      const changedOption = options[index]
      const method = changedOption.isCorrect ? 'POST' : 'DELETE'
      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers/multi-choice/options`,
        {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option: changedOption }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.multipleChoice && options && (
        <MultipleChoice
          id={`answer-editor-${questionId}`}
          selectOnly
          options={options}
          onChange={onOptionChange}
        />
      )}
    </Loading>
  )
}

const AnswerTrueFalse = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onTrueFalseChange = useCallback(
    async (isTrue) => {
      const answer = {
        answer:
          isTrue !== undefined
            ? {
                isTrue: isTrue,
              }
            : undefined,
      }

      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.trueFalse && (
        <TrueFalse
          id={`answer-editor-${questionId}`}
          allowUndefined={true}
          isTrue={answer.trueFalse.isTrue}
          onChange={onTrueFalseChange}
        />
      )}
    </Loading>
  )
}

const AnswerEssay = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onEssayChange = useCallback(
    async (content) => {
      if (answer.essay.content === content) return
      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answer: content
              ? {
                  content: content,
                }
              : undefined,
          }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, answer, onAnswerChange]
  )

  const debouncedOnChange = useDebouncedCallback(onEssayChange, 500)

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.essay && (
        <Essay
          id={`answer-editor-${questionId}`}
          content={answer.essay.content}
          onChange={debouncedOnChange}
        />
      )}
    </Loading>
  )
}

const AnswerWeb = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onWebChange = useCallback(
    async (web) => {
      const isEmptyWeb = !web || (!web.html && !web.css && !web.js)
      const answer = {
        answer: !isEmptyWeb
          ? {
              ...web,
            }
          : undefined,
      }

      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  const debouncedOnChange = useDebouncedCallback(onWebChange, 500)

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.web && (
        <Web
          id={`answer-editor-${questionId}`}
          web={answer.web}
          onChange={debouncedOnChange}
        />
      )}
    </Loading>
  )
}

export default AnswerEditor
