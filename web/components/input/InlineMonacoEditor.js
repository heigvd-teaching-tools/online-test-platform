import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
const getContentHeight = (editor, minHeight = 100) =>
  Math.max(minHeight, editor.getModel().getLineCount() * 19 + 21);

const InlineMonacoEditor = ({
  code,
  language = 'javascript',
  readOnly = false,
  onChange,
  minHeight = 0,
}) => {
  const [editor, setEditor] = useState(null)
  const [contentHeight, setContentHeight] = useState(100)
  const editorMount = (editor, _monaco) => {
    setEditor(editor)
    setContentHeight(getContentHeight(editor, minHeight))
  }

  useEffect(() => {
    if(editor){
      editor.setScrollPosition({ scrollTop: 0 })
      setContentHeight(getContentHeight(editor, minHeight))
    }
  }, [code, editor, minHeight])

  const onContentChange = useCallback(
    (newContent) => {
      setContentHeight(getContentHeight(editor, minHeight))
      onChange(newContent)
    },
    [editor, onChange]
  )

  return (
    <Editor
      height={contentHeight}
      width="100%"
      language={language}
      value={code}
      options={{
        readOnly: readOnly,
        minimap: { enabled: false },
        hideCursorInOverviewRuler: true,
        overviewRulerLanes: 0,
        scrollbar: {
          vertical: 'hidden',
          handleMouseWheel: false,
        },
      }}
      onChange={onContentChange}
      onMount={editorMount}
    />
  )
}

export default InlineMonacoEditor
