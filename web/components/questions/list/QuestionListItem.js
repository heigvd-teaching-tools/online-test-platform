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
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material'
import QuestionTypeIcon from '../../question/QuestionTypeIcon'
import LanguageIcon from '../../question/type_specific/code/LanguageIcon'
import DateTimeAgo from '../../feedback/DateTimeAgo'
import QuestionTagsViewer from '../../question/tags/QuestionTagsViewer'

const QuestionListItem = ({ question, selected, actions = [] }) => {
  return (
    <Paper
      sx={{ p: 1, width: '100%' }}
      variant={selected ? 'outlined' : 'elevation'}
    >
      <Stack spacing={2} p={2}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <QuestionTypeIcon type={question.type} size={32} withLabel />
            {question.title && question.title.length > 0 ? (
              <Typography variant="body1">{question.title}</Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{ color: 'error.main' }}
              >{`{missing title}`}</Typography>
            )}
          </Stack>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <QuestionTagsViewer size={'small'} tags={question.questionToTag} />
            {question.type === 'code' && question.code?.language && (
              <LanguageIcon language={question.code?.language} size={22} />
            )}
          </Stack>
        </Stack>

        <Stack
          justifyContent={'space-between'}
          alignItems={'center'}
          direction={'row'}
          width="100%"
        >
          <Stack direction={'row'} spacing={0} alignItems={'center'}>
            {actions}
          </Stack>
          <Box>
            <Tooltip title="Last updated" placement="top">
              <Typography variant="body2" color="textSecondary">
                <DateTimeAgo date={new Date(question.updatedAt)} />
              </Typography>
            </Tooltip>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default QuestionListItem
