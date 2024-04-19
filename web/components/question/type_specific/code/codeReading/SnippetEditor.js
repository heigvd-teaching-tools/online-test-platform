import React, { useEffect, useState } from 'react'
import { Stack, Typography, IconButton, Box, TextField } from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import InlineMonacoEditor from '@/components/input/InlineMonacoEditor'
import ContentEditor from '@/components/input/ContentEditor'

const SnippetEditor = ({ index, snippet, language, onChange,onDelete }) => {

  const [ code, setCode ] = useState(snippet.snippet)
  const [ output, setOutput ] = useState(snippet.output)

  useEffect(() => {
    setCode(snippet.snippet || "")
    setOutput(snippet.output || "")
  }, [snippet.snippet, snippet.output])

  return (
    <Stack direction={'column'} key={index} spacing={1}>    
      <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'} pl={1}>
        <Typography variant="h6">Snippet {index + 1}</Typography>
        <IconButton onClick={() => onDelete(snippet.id)} color="error">
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Stack>         
      <InlineMonacoEditor
        key={index}
        language={language}
        minHeight={60}
        code={ code }
        onChange={(code) => {
          setCode(code)
          setOutput("")
          onChange(code)
        }}
      />
      <Box px={1}>
        <TextField
          id={`output-${index}`}
          variant="standard"
          label={`Output`}
          value={output}
          multiline
          required
          fullWidth
          InputProps={{
            readOnly: true,
          }}
          error={output === '' || output == null}
          helperText={(output === '' || output == null) ? 'Dont forget to run the snippets to get the output' : ''}
        />
      </Box>
    </Stack>
  )
}

export default SnippetEditor
  