import { Box, Button, useTheme } from '@mui/material';
import InlineMonacoEditor from './InlineMonacoEditor'
import ReactMarkdown from 'react-markdown'
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import copyToClipboard from 'clipboard-copy';
import { useSnackbar } from '../../context/SnackbarContext';
import { useCallback } from 'react';
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

const ContentEditor = ({
  readOnly = false,
  language = 'markdown',
  rawContent,
  onChange,
}) => {
 
  return readOnly ? (
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
  ) : (
    <InlineMonacoEditor
      code={rawContent}
      language={language}
      readOnly={readOnly}
      onChange={onChange}
    />
  )
}

export default ContentEditor
