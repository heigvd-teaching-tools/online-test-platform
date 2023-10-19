import { Box, Button, FormControlLabel, IconButton, Stack, Switch, Typography, useTheme } from '@mui/material';
import InlineMonacoEditor from './InlineMonacoEditor'
import ReactMarkdown from 'react-markdown'
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import copyToClipboard from 'clipboard-copy';
import { useSnackbar } from '../../context/SnackbarContext';
import { useCallback, useState } from 'react';
import ScrollContainer from '../layout/ScrollContainer';
import ResizePanel from '../layout/utils/ResizePanel';
/*
        using Monaco Editor for editing content in markdown
        using ReactMarkdown for displaying content in markdown
*/

const CodeBlock = ({ language, value }) => {
  const theme = useTheme()

  const { show: showSnackbar } = useSnackbar()
  
  const handleCopyToClipboard = useCallback((code) => {
    copyToClipboard(code);
    // Optional: Show a notification or tooltip saying "Copied!"
    showSnackbar('Copied!', 'success')
  }, [showSnackbar])

  
  return (
    <Box border={`1px dashed ${theme.palette.divider}`} borderRadius={1} mr={1} mt={1} mb={1} position={"relative"}>
      <SyntaxHighlighter language={language}>
        {value}
      </SyntaxHighlighter>
      <Button 
          size="small"
          sx={{ position: 'absolute', top: 0, right: 0 }}
          onClick={() => handleCopyToClipboard(value)}
        >
          Copy
      </Button>
    </Box>
  )
}

const SourceViewIcon = ({ size = 24, active = false}) => {

  const theme = useTheme()
  const color = active ? theme.palette.primary.main : theme.palette.grey[500]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H21V21H3V3Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 8H18" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 12H18" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 16H12" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

const SplitViewIcon = ({ size = 24, active = false}) => {

  const theme = useTheme()
  const color = active ? theme.palette.primary.main : theme.palette.grey[500]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H21V21H3V3Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 3V21" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 8H10" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 12H10" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 16H12" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

const PreviewIcon = ({ size = 24, active = false}) => {

  const theme = useTheme()
  const color = active ? theme.palette.primary.main : theme.palette.grey[500]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H21V21H3V3Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
const ContentEditor = ({
  title,
  readOnly = false,
  height = "100%",
  rawContent,
  onChange,
}) => {


  return readOnly ? 
    <PreviewMarkdown 
      rawContent={rawContent} 
    /> 
  : 
    <EditMarkdown 
      title={title} 
      rawContent={rawContent} 
      height={height} 
      onChange={onChange} 
    />
    
}

const EditMarkdown = ({ title, rawContent, height, onChange }) => {

  const [ mode, setMode ] = useState("source")

  return (
    <Stack spacing={0} height={height}>
      <Stack direction="row" alignItems="center" spacing={1} justifyContent={"space-between"}>
        <Typography variant="body1">{title}</Typography>
        <Stack direction="row" alignItems="center" spacing={0}>
          <IconButton
            size='small'
            onClick={() => setMode('source')}
          >
            <SourceViewIcon
              active={mode === 'source'}
            />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => setMode('split')}
          >
            <SplitViewIcon 
              active={mode === 'split'}
            />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => setMode('preview')}
          >
            <PreviewIcon
              active={mode === 'preview'}
            />
          </IconButton>
        </Stack>
       

      </Stack>
      <ScrollContainer>
        {

          (
            mode === 'source' && (
              <InlineMonacoEditor
                code={rawContent}
                language={"markdown"}
                onChange={onChange}
              />)
          ) || (
          mode === 'split' && (
              <ResizePanel
                  leftPanel={
                    <InlineMonacoEditor
                      code={rawContent}
                      language={"markdown"}
                      onChange={onChange}
                    /> 
                  }
                  rightPanel={
                    <ScrollContainer>
                      <PreviewMarkdown 
                        rawContent={rawContent} 
                      /> 
                    </ScrollContainer>
                  }
              />
              )
            )
          || (
            mode === 'preview' && (
              <PreviewMarkdown 
                rawContent={rawContent} 
              /> 
            )
          )
        }
        
      </ScrollContainer>
    </Stack>
  )

}

const PreviewMarkdown = ({ rawContent }) => {
  return (
    <Box className="markdown-body">
    <ReactMarkdown
      remarkPlugins={[gfm]}
      components={{
        code: ({children:code, className, inline}) => {
          // If it's its inline code, we'll use the <code> component
          if(inline) return <code>{code}</code>
          // If it's a block, we'll use the SyntaxHighlighter component
          const language = className?.replace('language-', '') || 'text'
          return <CodeBlock language={language} value={code} />
        },
      }}
    >{rawContent?.toString()}</ReactMarkdown>
    </Box>
  )
}

export default ContentEditor
