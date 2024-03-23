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

import React from 'react'
import DialogFeedback from '../../feedback/DialogFeedback'
import { Stack, Typography } from '@mui/material'

import QuestionTypeIcon from '../../question/QuestionTypeIcon'

const CopyQuestionDialog = ({ open, onClose, handleCopyQuestion }) => {
  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title={`Copy question`}
      content={
        <Stack spacing={2}>
          <Typography variant="body1">
            Are you sure you want to copy this question?
          </Typography>
        </Stack>
      }
      onConfirm={() => handleCopyQuestion()}
    />
  )
}

export default CopyQuestionDialog
