import React from 'react'
import { Stack, Typography, IconButton, Box, TextField } from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import InlineMonacoEditor from '@/components/input/InlineMonacoEditor'

const SnippetEditor = ({ index, snippet, language, onChange,onDelete }) => {
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
          code={ snippet.snippet }
          onChange={onChange}
        />
        <Box px={1}>
          <TextField
            id={`output-${index}`}
            variant="standard"
            label={`Output`}
            value={snippet?.output || ''}
            multiline
            fullWidth
            InputProps={{
              readOnly: true,
            }}
            error={snippet.output === '' || snippet.output == null}
            helperText={(snippet.output === '' || snippet.output == null) ? 'Dont forget to run the snippets to get the output' : ''}
          />
        </Box>
      </Stack>
    )
}

export default SnippetEditor
  