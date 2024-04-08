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
import { QuestionType } from '@prisma/client'
import React, { useState } from 'react'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import { Stack, Typography } from '@mui/material'
import { toArray as typesToArray } from '@/components/question/types'
import { useSession } from 'next-auth/react'
import AlertFeedback from '@/components/feedback/AlertFeedback'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import LanguageSelector from '@/components/question/type_specific/code/LanguageSelector'
import TypeSelector from '@/components/question/TypeSelector'

import languages from '@/code/languages.json'

const types = typesToArray()

const defaultLanguage = languages.environments[0].language

const AddQuestionDialog = ({ open, onClose, handleAddQuestion }) => {
  const { data: session } = useSession()

  const [type, setType] = useState(types[0].value)
  const [language, setLanguage] = useState(defaultLanguage)

  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title={`Create new question in group ${session.user.selected_group?.label}`}
      content={
        <Stack spacing={2}>
          <Typography variant="body1">
            Select the type of question you want to create
          </Typography>
          <Stack
            spacing={1}
            sx={{ width: '500px' }}
            direction={'row'}
            alignItems={'center'}
          >
            <TypeSelector type={type} onChange={setType} />
            <QuestionTypeIcon type={type} size={50} />
          </Stack>
          {type === QuestionType.code && (
            <>
              <Typography variant="body1">
                Select the language of the code question
              </Typography>
              <LanguageSelector language={language} onChange={setLanguage} />
            </>
          )}
          <AlertFeedback severity="warning">
            <Typography variant="body1">
              You cannot change the type of a question after it has been
              created.
            </Typography>
          </AlertFeedback>
        </Stack>
      }
      onConfirm={() => handleAddQuestion(type, language)}
    />
  )
}

export default AddQuestionDialog
