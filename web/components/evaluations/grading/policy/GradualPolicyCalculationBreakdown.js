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
import KatexBloc from '@/components/input/markdown/KatexBloc'
import { Typography, Box, Stack } from '@mui/material'
import { useMemo } from 'react'

const GradualPolicyCalculationBreakdown = ({
  totalPoints,
  totalOptions,
  selectedCorrectOptions,
  unselectedCorrectOptions,
  selectedIncorrectOptions,
  unselectedIncorrectOptions,
  threshold,
  negativeMarking,
  finalScore,
  rawScore,
  correctnessRatio,
}) => {
  let appliedFinalFormulaCondition = null

  // Ensure final score is zero if threshold is not met
  if (correctnessRatio < threshold / 100 && rawScore > 0) {
    finalScore = 0
    appliedFinalFormulaCondition = `\\text{Since Correctness Ratio} < \\frac{${threshold}}{100} \\text{ and Raw Score > 0, Final Score} = 0`
  }

  // Ensure final score is not negative if negative marking is disabled
  if (!negativeMarking) {
    finalScore = Math.max(0, finalScore)
    if (appliedFinalFormulaCondition === null && finalScore !== rawScore) {
      appliedFinalFormulaCondition = `\\text{Since Negative Marking is Disabled, Final Score} = \\max(0, ${rawScore?.toFixed(
        2,
      )}) = ${finalScore?.toFixed(2)}`
    }
  }

  // Round to 2 decimal places
  finalScore = Math.round(finalScore * 100) / 100

  if (appliedFinalFormulaCondition === null) {
    appliedFinalFormulaCondition = `\\text{Final Score remains as } ${finalScore?.toFixed(
      2,
    )}`
  }

  const ready = useMemo(() => {
    const isNotNullOrUndefined = (value) =>
      value !== null && value !== undefined

    return (
      isNotNullOrUndefined(totalPoints) &&
      isNotNullOrUndefined(totalOptions) &&
      isNotNullOrUndefined(selectedCorrectOptions) &&
      isNotNullOrUndefined(unselectedCorrectOptions) &&
      isNotNullOrUndefined(selectedIncorrectOptions) &&
      isNotNullOrUndefined(unselectedIncorrectOptions) &&
      isNotNullOrUndefined(threshold) &&
      isNotNullOrUndefined(negativeMarking) &&
      isNotNullOrUndefined(finalScore) &&
      isNotNullOrUndefined(rawScore) &&
      isNotNullOrUndefined(correctnessRatio)
    )
  }, [
    totalPoints,
    totalOptions,
    selectedCorrectOptions,
    unselectedCorrectOptions,
    selectedIncorrectOptions,
    unselectedIncorrectOptions,
    threshold,
    negativeMarking,
    finalScore,
    rawScore,
    correctnessRatio,
  ])

  return (
    ready && (
      <Stack spacing={1}>
        <Typography variant="h6">
          Multiple-Choice Gradual Credit Policy Breakdown
        </Typography>
        <Typography variant="caption">
          <Box>
            <Typography variant="body1">Variables</Typography>
            <ul>
              <li>
                Total Points: <b>{totalPoints}</b>
              </li>
              <li>
                <b>TO</b> (Total Options) : <b>{totalOptions}</b>
              </li>
              <li>
                <b>Cs</b> (Selected Correct): <b>{selectedCorrectOptions}</b>
              </li>
              <li>
                <b>Cm</b> (Missed Correct): <b>{unselectedCorrectOptions}</b>
              </li>
              <li>
                <b>Is</b> (Selected Incorrect): <b>{selectedIncorrectOptions}</b>
              </li>
              <li>
                <b>Im</b> (Missed Incorrect): <b>{unselectedIncorrectOptions}</b>
              </li>
              <li>
                <b>CR</b> (Correctness Ratio): <b>{correctnessRatio.toFixed(2)}</b>
              </li>
              <li>
                Threshold: <b>{threshold}%</b>
              </li>
              <li>
                Negative Marking:{' '}
                <b>{negativeMarking ? 'Enabled' : 'Disabled'}</b>
              </li>
              
            </ul>
          </Box>
          <Box>
            <Typography variant="body1">Correctness Ratio Formula:</Typography>
          </Box>
          <KatexBloc
            code={`\\frac{Cs - Cm + Im - Is}{\\text{TO}}`}
          />
          <Box>
            <Typography variant="body1">Substitute Variables:</Typography>
          </Box>
          <KatexBloc
            code={`
              \\text{CR} = \\frac{${selectedCorrectOptions} - ${unselectedCorrectOptions} + ${unselectedIncorrectOptions} - ${selectedIncorrectOptions}}{${totalOptions}} = ${correctnessRatio.toFixed(
              2,
            )}
            `}
          />
          <KatexBloc
            code={`
              \\text{Raw Score} = ${totalPoints} \\times ${correctnessRatio?.toFixed(
              2,
            )} = ${rawScore.toFixed(2)}
            `}
          />
          <Box>
            <Typography variant="body1">Final Score Formula:</Typography>
          </Box>
          <KatexBloc
            code={`
                \\text{Final Score} = 
                \\begin{cases} 
                0 & \\text{if CR} < \\frac{\\text{${threshold}}}{100} \\text{ and Raw Score > 0} \\\\
                \\max(0, \\text{Raw Score}) & \\text{if Negative Marking Disabled} \\\\
                \\text{Raw Score} & \\text{otherwise}
                \\end{cases}
              `}
          />
          <KatexBloc code={appliedFinalFormulaCondition} />
        </Typography>
      </Stack>
    )
  )
}

export default GradualPolicyCalculationBreakdown
