import languages from '../../../../../code/languages.json'
import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Typography } from '@mui/material'
import InlineMonacoEditor from '../../../../input/InlineMonacoEditor'

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
          bgcolor="white"
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
                if (ev.target.value === file?.content) return
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
          language={languageBasedOnPathExtension(path)}
          readOnly={readonlyContent}
          minHeight={100}
          onChange={(code) => {
            if (code === file?.content) return
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
