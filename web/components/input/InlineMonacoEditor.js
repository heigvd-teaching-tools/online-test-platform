import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
const getContentHeight = (editor) =>
  Math.max(100, editor.getModel().getLineCount() * 19 + 21) // little magic number dont hurt anyone
const InlineMonacoEditor = ({
  code,
  language = 'javascript',
  readOnly = false,
  onChange,
}) => {
  const [editor, setEditor] = useState(null)
  const [contentHeight, setContentHeight] = useState(100)
  const editorMount = (editor, _monaco) => {
    setEditor(editor)
    setContentHeight(getContentHeight(editor))
  }

  useEffect(() => {
    if (editor) {
      editor.setScrollPosition({ scrollTop: 0 })
    }
  }, [contentHeight])

  const onContentChange = useCallback(
    (newContent) => {
      setContentHeight(getContentHeight(editor))
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
