import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { Stack } from '@mui/material';

const getContentHeight = (editor, minHeight = 100) =>
  Math.max(minHeight, editor.getModel().getLineCount() * 19 + 21);

const InlineMonacoEditor = ({
  code,
  language = 'javascript',
  readOnly = false,
  onChange,
  minHeight = 100,
}) => {
  const [editor, setEditor] = useState(null)
  const [contentHeight, setContentHeight] = useState(100)
  const editorMount = (editor, _monaco) => {
    setEditor(editor)
    setContentHeight(getContentHeight(editor, minHeight))
  }

  useEffect(() => {
    if(editor){
      const newContentHeight = getContentHeight(editor, minHeight)
      editor.setScrollPosition({ scrollTop: 0 })
      setContentHeight(newContentHeight)
    }
  }, [code, editor, minHeight])

  const onContentChange = useCallback(
    (newContent) => {
      const newContentHeight = getContentHeight(editor, minHeight)      
      setContentHeight(newContentHeight)
      editor.setScrollPosition({ scrollTop: 0 })
      onChange(newContent)
    },
    [editor, onChange]
  )

  return (
    <Stack minHeight={contentHeight} height={contentHeight} width="100%" position="relative">
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
    </Stack>
  )
}

export default InlineMonacoEditor
