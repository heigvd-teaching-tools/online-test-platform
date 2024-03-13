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
import ContentEditor from '../input/ContentEditor'
import { Stack, Chip, Typography } from '@mui/material'
import Column from '../layout/utils/Column'
import ScrollContainer from '../layout/ScrollContainer'

const QuestionView = ({ order, points, question, totalPages }) => {
  return (
    <Stack
      height={'100%'}
      width={'100%'}
      spacing={2}
      overflow={'auto'}
      pl={2}
      pt={2}
      pr={1}
      pb={1}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Column width="32px">
          <Image
            alt={`Question Type Icon`}
            src={`/svg/questions/${question.type}.svg`}
            width={32}
            height={32}
            priority="1"
          />
        </Column>
        <Column right>
          <Typography variant="body1">
            <b>Q{order + 1}</b> / {totalPages}{' '}
          </Typography>
        </Column>
        <Column flexGrow={1} right>
          <Chip color="info" label={`${points} pts`} />
        </Column>
      </Stack>
      <Stack flex={1} spacing={1}>
        <Typography variant="h4">{question.title}</Typography>
        <ScrollContainer>
          <ContentEditor
            id={'questions-view-' + question.id}
            readOnly
            rawContent={question.content}
          />
        </ScrollContainer>
      </Stack>
    </Stack>
  )
}

export default QuestionView
