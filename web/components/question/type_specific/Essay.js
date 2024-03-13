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
import ContentEditor from '../../input/ContentEditor'
import { Stack } from '@mui/material'

const Essay = ({ id = 'essay', mode = 'source', title, content, onChange }) => {
  return (
    <Stack spacing={1} width="100%" height="100%" position="relative" p={1}>
      <ContentEditor
        id={id}
        title={title}
        mode={mode}
        rawContent={content}
        onChange={(newContent) => {
          if (newContent === content) return
          onChange(newContent === '' ? undefined : newContent)
        }}
      />
    </Stack>
  )
}

export default Essay
