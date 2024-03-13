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
import Image from 'next/image'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { getTextByType, getTooltipByType } from './types.js'

const QuestionTypeIcon = ({ type, size = 32, withLabel = false }) => {
  return (
    <Tooltip title={getTooltipByType(type)} placement="top-start">
      <Stack
        direction={'row'}
        spacing={1}
        alignItems={'center'}
        minHeight={size}
      >
        <Box minWidth={size} minHeight={size}>
          <Image
            alt="Question Type Icon"
            src={`/svg/questions/${type}.svg`}
            width={size}
            height={size}
            priority="1"
          />
        </Box>
        {withLabel && (
          <Typography variant="caption" sx={{ textAlign: 'center' }}>
            <b>{getTextByType(type)}</b>
          </Typography>
        )}
      </Stack>
    </Tooltip>
  )
}
export default QuestionTypeIcon
