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
import languages from '../../../../../code/languages.json'
import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Typography } from '@mui/material'
import InlineMonacoEditor from '../../../../input/InlineMonacoEditor'
import { useTheme } from '@emotion/react'

const languageBasedOnPathExtension = (path) => {
  if (!path) return null
  const extension = path.split('.').pop()
  return languages.monacoExtensionToLanguage[extension]
}

const FileEditor = ({
  file,
  readonlyPath = false,
  readonlyContent = false,
  onChange = () => {},
  secondaryActions,
  leftCorner,
}) => {
  const theme = useTheme()
  // automatically set language based on path extension
  const [language, setLanguage] = useState(
    languageBasedOnPathExtension(file?.path)
  )

  const [path, setPath] = useState(file?.path)
  const [content, setContent] = useState(file?.content)

  useEffect(() => {
    setPath(file?.path)
    setContent(file?.content)
    setLanguage(languageBasedOnPathExtension(file?.path) || 'text')
  }, [file?.id, file?.path, file?.content])

  return (
    file && (
      <Stack position="relative">
        <Stack
          direction="row"
          position="sticky"
          top={0}
          spacing={1}
          p={2}
          alignItems="center"
          justifyContent="center"
          zIndex={1}
          bgcolor={theme.palette.background.paper}
        >
          {leftCorner}
          {(!readonlyPath && (
            <TextField
              id={`${file.id}-${path}`}
              variant="standard"
              label={`Path [syntax: ${language}]`}
              value={path}
              fullWidth
              onChange={(ev) => {
                const path = ev.target.value
                if (path === file.path) return
                file.path = path
                setPath(ev.target.value)
                onChange({
                  ...file,
                  path: ev.target.value,
                })
              }}
            />
          )) || (
            <Box width="100%" maxWidth="100%" overflow="hidden">
              <Typography variant="body1"> {path} </Typography>
            </Box>
          )}
          {secondaryActions}
        </Stack>
        <InlineMonacoEditor
          code={content}
          language={language}
          readOnly={readonlyContent}
          minHeight={100}
          onChange={(code) => {
            if (code === file?.content) return
            file.content = code
            setContent(code)
            onChange({
              ...file,
              content: code,
            })
          }}
        />
      </Stack>
    )
  )
}

export default FileEditor
