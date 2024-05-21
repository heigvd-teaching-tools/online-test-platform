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
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'

const AllOrNothingPolicyCalculationBreakdown = ({
  totalPoints,
  correctOptions,
  incorrectOptions,
  selectedCorrectOptions,
  selectedIncorrectOptions,
  finalScore,
}) => {
  const allCorrectOptionsSelected =
    selectedCorrectOptions === correctOptions && selectedIncorrectOptions === 0

  return (
    <Stack spacing={1}>
      <Typography variant="h6">
        All-Or-Nothing Policy Calculation Breakdown
      </Typography>
      <Typography variant="caption">
        <Box>
          <Typography variant="body1">Variables</Typography>
          <ul>
            <li>Total Points: {totalPoints}</li>
            <li>Total Correct Options: {correctOptions}</li>
            <li>Total Incorrect Options: {incorrectOptions}</li>
            <li>Selected Correct Options: {selectedCorrectOptions}</li>
            <li>Selected Incorrect Options: {selectedIncorrectOptions}</li>
          </ul>
        </Box>
        <Box>
          <KatexBloc
            code={`
                        \\text{Final Score} = 
                        \\begin{cases} 
                        \\text{Total Points} & \\text{if All Correct Options and No Incorrect Options} \\\\
                        0 & \\text{otherwise}
                        \\end{cases}
                        `}
          />
        </Box>
        <Typography>
          <Box>
            <Typography variant="body1">Calculation Breakdown:</Typography>
          </Box>

          <Box>
            <Typography variant="body2">
              All Correct Options Selected:{' '}
              {allCorrectOptionsSelected ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2">
              Any Incorrect Options Selected:{' '}
              {selectedIncorrectOptions > 0 ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <b>Final Score:</b> {finalScore.toFixed(2)}
            </Typography>
          </Box>
        </Typography>
      </Typography>
    </Stack>
  )
}

export default AllOrNothingPolicyCalculationBreakdown
