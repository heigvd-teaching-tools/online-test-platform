import InlineMonacoEditor from './InlineMonacoEditor'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
/*
        using Monaco Editor for editing content in markdown
        using ReactMarkdown for displaying content in markdown
*/
const ContentEditor = ({
  readOnly = false,
  language = 'markdown',
  rawContent,
  onChange,
}) => {
  return readOnly ? (
    <ReactMarkdown
      components={{
        code: ({ children, className}) => {
          const language = className?.replace('language-', '') || 'text'
          return (
            <SyntaxHighlighter language={language}>
              {children}
            </SyntaxHighlighter>
          )
        },
      }}
    >{rawContent?.toString()}</ReactMarkdown>
  ) : (
    <InlineMonacoEditor
      minHeight={100}
      code={rawContent}
      language={language}
      readOnly={readOnly}
      onChange={onChange}
    />
  )
}

export default ContentEditor
