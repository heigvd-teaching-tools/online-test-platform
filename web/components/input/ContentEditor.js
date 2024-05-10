/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import copyToClipboard from 'clipboard-copy'
import { useSnackbar } from '@/context/SnackbarContext'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import MDEditor, { commands } from '@uiw/react-md-editor'


import StatusDisplay from '../feedback/StatusDisplay'
import Overlay from '../ui/Overlay'

import rehypeSanitize from 'rehype-sanitize'
import { getCodeString } from 'rehype-rewrite'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from "mermaid";
import { v4 as uuidv4 } from 'uuid'; 

/*
        using Monaco Editor for editing content in markdown
        using ReactMarkdown for displaying content in markdown
*/

const mainCommands = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.hr,
  commands.title,
  commands.divider,
  commands.link,
  commands.quote,
  commands.code,
  commands.image,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.checkedListCommand,
]

const extraCommands = [
  commands.codeEdit,
  commands.codeLive,
  commands.codePreview,
  commands.divider,
  commands.fullscreen,
]

// Initialize Mermaid's global settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'default', 
});

const MermaidChart = ({ code }) => {
  const ref = useRef(null);
  const [id] = useState(uuidv4()); // Create a unique ID for each component instance

  useLayoutEffect(() => {
    // Make sure the code is not attempted to be rendered server-side
    if (typeof window !== 'undefined' && ref.current && code) {
      // Check if the container is properly initialized
      if (ref.current.clientHeight > 0 && ref.current.clientWidth > 0) {
        try {
          mermaid.render(`mermaid-${id}`, code, ref.current).then(({ bindFunctions, svg }) => {
            ref.current.innerHTML = svg;
            if (bindFunctions && Array.isArray(bindFunctions)) {
              bindFunctions.forEach(f => f(ref.current));
            }
          }).catch((error) => {
            //ignore
          });
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
        }
      } else {
        console.warn('Container not ready or has zero dimensions, delaying Mermaid rendering.');
      }
    }
  }, [code, id]); // Include id in the dependencies array

  return <div ref={ref} style={{ width: '100%', minHeight: '100px' }} />;
};


const previewOptions = {
  rehypePlugins: [[rehypeSanitize]],
  components: {
    code: ({ children = [], className, node, ...props }) => {
      const position = node?.position || {}
      const inline =
        !position.start.line || position.start.line === position.end.line
      const language =
        className?.split(' ')[0].replace('language-', '') || 'javascript'

      if (inline) {
        const txt = children
        if (typeof txt === 'string' && /^\$\$(.*)\$\$/.test(txt)) {
          const html = katex.renderToString(
            txt.replace(/^\$\$(.*)\$\$/, '$1'),
            {
              throwOnError: false,
            },
          )
          return <code dangerouslySetInnerHTML={{ __html: html }} />
        }
        return <CodeInline value={txt} />
      } else {
        const txt = children[0]
        const code = node && node.children ? getCodeString(node.children) : txt

        if (['latex', 'katex'].includes(language.toLowerCase())) {
          const html = katex.renderToString(code, {
            throwOnError: false,
          })
          return <code dangerouslySetInnerHTML={{ __html: html }} />
        } else if (language === 'mermaid') {
          return <MermaidChart code={code} />

        } else {
          return <CodeBlock language={language} value={code} />
        }
      }
    },
  },
}

const defaultEditorOptions = {
  height: '100%',
  overflow: false,
  visibleDragbar: false,
  enableScroll: false,
  preview: 'live',
}

const ContentEditor = ({
  title,
  groupScope,
  readOnly = false,
  withPaste = false,
  rawContent = '',
  onChange,
}) => {
  const { show: showSnackbar } = useSnackbar()

  return (
    <Box data-color-mode="light" height={'100%'} overflow={"hidden"}>
      { !readOnly && (
        <Stack direction="row" alignItems="center" spacing={1} py={.5}>
          <Typography variant="body1">{title}</Typography>
          <Typography variant="caption">(markdown)</Typography>
        </Stack>
      )}
      <MarkdownEditor
        groupScope={groupScope}
        editorProps={{
          ...defaultEditorOptions,
          preview: readOnly ? 'preview' : 'live',
        }}
        previewOptions={previewOptions}
        commands={readOnly ? [] : mainCommands}
        extraCommands={readOnly ? [] : extraCommands}
        withPaste={withPaste}
        content={rawContent}
        onChange={onChange}
        onError={(error) => showSnackbar(error, 'error')}
      />
    </Box>
  )
}

const MarkdownEditor = ({
  groupScope,
  withPaste = false,
  editorProps,
  previewOptions,
  commands,
  extraCommands,
  content: initial,
  onChange,
  onError,
}) => {
  const ref = useRef(null)

  const [content, setContent] = useState(initial)

  const [ uploadStatus, setUploadStatus ] = useState("NOT_STARTED")

  useEffect(() => {
    setContent(initial)
  }, [initial])

  const handleChange = useCallback(
    (value) => {
      setContent(value)
      onChange(value)
    },
    [onChange],
  )

  const handlePaste = useCallback(
    async (e) => {
      if (!groupScope) return

      const items = e.clipboardData.items

      for (const item of items) {
        if (item.kind !== 'file') continue

        setUploadStatus("RUNNING")

        const blob = item.getAsFile()
        if (!blob) continue // Skip non-file items

        const formData = new FormData()
        formData.append('file', blob)

        try {
          const response = await fetch(`/api/${groupScope}/upload`, {
            method: 'POST',
            body: formData,
          })
          const data = await response.json()
          const [type, _] = blob.type.split('/') // Destructure MIME type into type and subtype
          if (response.ok) {
            switch (type) {
              case 'image':
                insertImageInEditor(data.fileUrl, blob.name)
                break
              case 'application':
              case 'text':
                insertDocumentLinkInEditor(data.fileUrl, blob.name)
                break
              default:
                onError && onError(`Unsupported file type: ${blob.type}`)
            }
          } else {
            onError && onError(data.message)
          }
        } catch (error) {
          onError && onError(`Error uploading file: ${error.message}`)
        }
        setUploadStatus("NOT_STARTED")       
      }
    },
    [groupScope, onError],
  )

  const insertImageInEditor = (imageUrl, imageName) => {
    const markdownImageSyntax = `![${imageName}](${imageUrl})`
    insertTextAtCursor(markdownImageSyntax)
  }

  const insertDocumentLinkInEditor = (fileUrl, fileName) => {
    const markdownLinkSyntax = `[${fileName}](${fileUrl})`
    insertTextAtCursor(markdownLinkSyntax)
  }

  const insertTextAtCursor = useCallback(
    (text) => {
      const textarea = ref.current.textarea
      if (!textarea) return

      const selectionStart = textarea.selectionStart
      const selectionEnd = textarea.selectionEnd

      const textBefore = textarea.value.substring(0, selectionStart)
      const textAfter = textarea.value.substring(
        selectionEnd,
        textarea.value.length,
      )

      const newValue = textBefore + text + textAfter

      handleChange(newValue)
      textarea.selectionStart = textarea.selectionEnd =
        selectionStart + text.length
    },
    [handleChange],
  )

  return (
    <Stack position={"relative"} height={'100%'}>
      <UploadingStatus status={uploadStatus} />
      <MDEditor
        ref={ref}
        value={content}
        {...editorProps}
        previewOptions={previewOptions}
        commands={commands}
        extraCommands={extraCommands}
        onChange={handleChange}
        onPaste={withPaste ? handlePaste : undefined}
        textareaProps={{
          placeholder: 'Markdown content...',
        }}
      />
    </Stack>
  )
}

const UploadingStatus = ({ status = "NOT_STARTED" }) => {
  return status !== "NOT_STARTED" ? (
    <Overlay>
      <StatusDisplay
        status={status}
        size={40}
      />
    </Overlay>
  ) : null
}


const CodeBlock = ({ language, value }) => {
  const theme = useTheme()

  const { show: showSnackbar } = useSnackbar()

  const handleCopyToClipboard = useCallback(
    (code) => {
      copyToClipboard(code)
      // Optional: Show a notification or tooltip saying "Copied!"
      showSnackbar('Copied!', 'success')
    },
    [showSnackbar],
  )

  return (
    <Box borderRadius={1} position={'relative'}>
      <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>
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

const CodeInline = ({ value }) => {
  return <code>{value}</code>
}


export default ContentEditor
