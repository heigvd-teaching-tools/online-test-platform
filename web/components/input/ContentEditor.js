import InlineMonacoEditor from './InlineMonacoEditor'
import ReactMarkdown from 'react-markdown'
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
    <ReactMarkdown>{rawContent?.toString()}</ReactMarkdown>
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
