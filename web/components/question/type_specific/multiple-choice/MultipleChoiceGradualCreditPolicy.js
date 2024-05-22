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
import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Stack, Typography, Collapse, Alert, AlertTitle } from '@mui/material'
import CheckboxLabel from '@/components/input/CheckboxLabel'
import DecimalInput from '@/components/input/DecimalInput'

import UserHelpPopper from '@/components/feedback/UserHelpPopper'
import { useDebouncedCallback } from 'use-debounce'
import { fetcher } from '@/code/utils'
import Loading from '@/components/feedback/Loading'
import KatexBloc from '@/components/input/markdown/KatexBloc'

const MultipleChoiceGradualCreditPolicy = ({
  groupScope,
  questionId,
  onUpdate,
}) => {
  const {
    data: gradualCreditConfig,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/questions/${questionId}/multiple-choice/grading-policy/gradual-credit`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  const saveGradualCreditPolicy = useCallback(
    async (gradualCreditConfig) => {
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/grading-policy/gradual-credit`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(gradualCreditConfig),
        },
      )
        .then((data) => data.json())
        .then(async () => {
          onUpdate && onUpdate()
          await mutate()
        })
    },
    [groupScope, questionId, mutate, onUpdate],
  )

  const debouncedSaveGradualCreditPolicy = useDebouncedCallback(
    saveGradualCreditPolicy,
    500,
  )

  const createGradualCreditPolicy = useCallback(async () => {
    await fetch(
      `/api/${groupScope}/questions/${questionId}/multiple-choice/grading-policy/gradual-credit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          negativeMarking: false,
          threshold: 0,
        }),
      },
    )
      .then((data) => data.json())
      .then(async () => {
        onUpdate && onUpdate()
        await mutate()
      })
  }, [groupScope, questionId, mutate, onUpdate])

  useEffect(() => {
    if (error?.status === 404) {
      createGradualCreditPolicy()
    }
  }, [error, createGradualCreditPolicy])

  const [negativeMarking, setNegativeMarking] = useState(
    gradualCreditConfig?.negativeMarking,
  )
  const [threshold, setThreshold] = useState(
    gradualCreditConfig?.threshold || 0,
  )

  const [showFormula, setShowFormula] = useState(false)

  useEffect(() => {
    setNegativeMarking(gradualCreditConfig?.negativeMarking)
    setThreshold(gradualCreditConfig?.threshold)
  }, [gradualCreditConfig])

  return (
    <Loading loading={!gradualCreditConfig} errors={[error]}>
      <Stack spacing={1}>
        <Alert severity="info">
          <AlertTitle>Gradual Credit</AlertTitle>
          <Typography variant="body1">
            Gradual Credit awards points based on the student&apos;s selection
            of correct and incorrect options:
            <ul>
              <li>Points are earned for each correct option chosen.</li>
              <li>Points are lost for each incorrect option chosen.</li>
              <li>
                If the overall accuracy is below the set <b>threshold</b> and a
                score is positive, final score will be zero.
              </li>
              <li>
                If <b>negative marking</b> is disabled, final score will be at
                least zero.
              </li>
              <li>
                If <b>negative marking</b> is enabled, your final score can be
                negative.
              </li>
            </ul>
          </Typography>

          <CheckboxLabel
            label="Show formula"
            checked={showFormula}
            onChange={setShowFormula}
          />
          <Collapse in={showFormula}>
            <Typography variant="caption">
              <KatexBloc
                code={`
                \\text{Correctness Ratio} = \\left( \\frac{\\text{Selected Correct Options}}{\\text{Total Correct Options}} \\right) - \\left( \\frac{\\text{Selected Incorrect Options}}{\\text{Total Incorrect Options}} \\right)
              `}
              />
              <KatexBloc
                code={`
                \\text{Raw Score} = \\text{Total Points} \\times \\text{Correctness Ratio}
                `}
              />
              <KatexBloc
                code={`
                \\text{Final Score} = 
                \\begin{cases} 
                0 & \\text{if Correctness Ratio} < \\frac{\\text{Threshold}}{100} \\text{ and Raw Score > 0} \\\\
                \\max(0, \\text{Raw Score}) & \\text{if Negative Marking Disabled} \\\\
                \\text{Raw Score} & \\text{otherwise}
                \\end{cases}
              `}
              />
            </Typography>
          </Collapse>
        </Alert>
        {negativeMarking !== undefined && (
          <Stack spacing={1} direction={'row'}>
            <CheckboxLabel
              label="Enable negative marking"
              checked={negativeMarking || false}
              onChange={(checked) => {
                setNegativeMarking(checked)
                debouncedSaveGradualCreditPolicy({
                  negativeMarking: checked,
                  threshold,
                })
              }}
            />
            <UserHelpPopper>
              <Alert severity="info">
                <AlertTitle>Negative Marking</AlertTitle>
                <Typography variant="body2">
                  If negative marking is enabled, the student&apos;s total score
                  for the question can be reduced below zero due to incorrect
                  selections.
                </Typography>
              </Alert>
              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                <Typography variant="body2">
                  Consider enabling the selection limiter to prevent students
                  from selecting more options than expected.
                </Typography>
              </Alert>
            </UserHelpPopper>
          </Stack>
        )}

        {threshold !== undefined && (
          <Stack spacing={1} direction={'row'} alignItems={'center'}>
            <DecimalInput
              label="Threshold for partial credit"
              variant="standard"
              value={threshold}
              sx={{
                width: '200px',
              }}
              size={'small'}
              onChange={(value) => {
                setThreshold(value)
                debouncedSaveGradualCreditPolicy({
                  negativeMarking,
                  threshold: value,
                })
              }}
              min={0}
              max={100}
              placeholder="0 - 100"
              rightAdornement={<Typography variant={'body1'}>%</Typography>}
            />

            <UserHelpPopper width={700}>
              <Alert severity="info">
                <AlertTitle>Threshold for partial credit</AlertTitle>
                <Typography variant="body2">
                  The correctness ratio must be greater than or equal to the
                  threshold to earn points.
                </Typography>
                <KatexBloc
                  code={`
                  \\text{Correctness Ratio} = \\left( \\frac{\\text{Selected Correct Options}}{\\text{Total Correct Options}} \\right) - \\left( \\frac{\\text{Selected Incorrect Options}}{\\text{Total Incorrect Options}} \\right)
                `}
                />
                <Typography variant="body2">
                  The threshold only applies on positive scores.
                </Typography>
              </Alert>
            </UserHelpPopper>
          </Stack>
        )}
      </Stack>
    </Loading>
  )
}

export default MultipleChoiceGradualCreditPolicy