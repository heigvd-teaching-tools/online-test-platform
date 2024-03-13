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
import { Box, Stack, Typography } from '@mui/material'
import RadioViewer from '@/components/input/RadioViewer'

const ConsultMultipleChoice = ({ options, answer }) => {
  return (
    <Box p={2} pt={1} height={'100%'}>
      <Stack spacing={2} padding={2}>
        {options?.map((option, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flex: 1 }}
          >
            <RadioViewer
              mode={'consult'}
              key={index}
              isCorrect={option.isCorrect}
              isFilled={answer.some((opt) => opt.id === option.id)}
            />
            <Box>
              <Typography variant="body1">{option.text}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default ConsultMultipleChoice
