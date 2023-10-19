import React from 'react'
import ContentEditor from '../../input/ContentEditor'
import { Stack } from '@mui/material'

const Essay = ({ id = 'essay', content, onChange }) => {
  return (
    <Stack spacing={1} width="100%" height="100%" position="relative" p={1}>
      <ContentEditor
        id={id}
        title={"Essay Solution"}
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
