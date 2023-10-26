import { Box, Button, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import InlineMonacoEditor from './InlineMonacoEditor'
import ReactMarkdown from 'react-markdown'
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import copyToClipboard from 'clipboard-copy';
import { useSnackbar } from '../../context/SnackbarContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollContainer from '../layout/ScrollContainer';
import ResizePanel from '../layout/utils/ResizePanel';
/*
        using Monaco Editor for editing content in markdown
        using ReactMarkdown for displaying content in markdown
*/

const ContentEditor = ({
  title,
  readOnly = false,
  height = "100%",
  rawContent = '',
  mode = 'source',
  onChange,
}) => {

  return readOnly ? 
    <PreviewMarkdown 
      rawContent={rawContent} 
    /> 
  : 
    <EditMarkdown 
      title={title || ''} 
      mode={mode}
      rawContent={rawContent} 
      height={height} 
      onChange={onChange} 
    />
    
}

const EditMarkdown = ({ title, mode:initialMode = "source", rawContent: initial, height, onChange }) => {

  const ref = useRef(null)

  const readOnly = onChange === undefined

  const [ mode, setMode ] = useState(initialMode)

  const [ rawContent, setRawContent ] = useState(initial || '')

  useEffect(() => {
    setRawContent(initial)
  }, [initial])


  const onChangeContent = useCallback((newContent) => {
    setRawContent(newContent)
    onChange(newContent === '' ? undefined : newContent)
  }, [rawContent, onChange])

  return (
    <Stack spacing={0} height={height} ref={ref}>
      <Stack direction="row" alignItems="center" spacing={1} justifyContent={"space-between"}>
        <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body1">{title}</Typography>
        <Typography variant="caption">(markdown)</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0}>
          <Tooltip title="Source view">
            <IconButton
              size='small'
              onClick={() => setMode('source')}
            >
              <SourceViewIcon
                active={mode === 'source'}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Split view">
            <IconButton
              size='small'
              onClick={() => setMode('split')}
            >
              <SplitViewIcon 
                active={mode === 'split'}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Preview">
            <IconButton
              size='small'
              onClick={() => setMode('preview')}
            >
              <PreviewIcon
                active={mode === 'preview'}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <ScrollContainer>
        {(
          mode === 'source' && (
            
              <InlineMonacoEditor
                code={rawContent}
                language={"markdown"}
                readOnly={readOnly}
                onChange={onChangeContent}
              />
              )
          ) || (
          mode === 'split' && (
              <ResizePanel
                  leftPanel={
                    <ScrollContainer>
                      <InlineMonacoEditor
                        code={rawContent}
                        language={"markdown"}
                        readOnly={readOnly}
                        onChange={onChangeContent}
                      /> 
                    </ScrollContainer>
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
        <path d="M3 3H21V21H3V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 8H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 16H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const SplitViewIcon = ({ size = 24, active = false}) => {

  const theme = useTheme()
  const color = active ? theme.palette.primary.main : theme.palette.grey[500]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H21V21H3V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 8H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 16H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const PreviewIcon = ({ size = 24, active = false}) => {

  const theme = useTheme()
  const color = active ? theme.palette.primary.main : theme.palette.grey[500]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H21V21H3V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


export default ContentEditor
