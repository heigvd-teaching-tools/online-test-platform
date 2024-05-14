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
import { Alert, Box, Stack, TextField, Typography } from '@mui/material'

import { useSnackbar } from '@/context/SnackbarContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'
import StatusDisplay from '../../feedback/StatusDisplay'
import Overlay from '../../ui/Overlay'
import ScrollContainer from '../../layout/ScrollContainer'
import { previewOptions } from './previewOptions'
import UserHelpPopper from '@/components/feedback/UserHelpPopper'
import Link from 'next/link'

const mermaidExample = `\`\`\`mermaid
graph TD
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
\`\`\``

const mermaidExample2 = `\`\`\`mermaid
classDiagram
    Animal <|-- Dog
    Dog <|-- Poodle
    Animal : +int age
    Dog : +string breed
    Dog : +void bark()
    Dog : +bool canFetch()
    Poodle : +string color
    Poodle : +void performTricks()
    Poodle : +string instagramID "@maxi.pas21"
\`\`\``

const latexExample = `\`\`\`latex
c = \\pm\\sqrt{a^2 + b^2}
\`\`\``

const mainCommands = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  commands.group(
    [
      commands.title1,
      commands.title2,
      commands.title3,
      commands.title4,
      commands.title5,
      commands.title6,
    ],
    {
      name: 'title',
      groupName: 'title',
      buttonProps: { 'aria-label': 'Insert title' },
    },
  ),
  commands.divider,
  commands.link,
  commands.quote,
  commands.codeBlock,
  commands.image,
  commands.divider,
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

const defaultEditorOptions = {
  height: '100%',
  overflow: false,
  visibleDragbar: false,
  enableScroll: false,
  preview: 'live',
}

const MarkdownEditor = ({
  title,
  groupScope,
  readOnly = false,
  withUpload = false,
  rawContent = '',
  onChange,
  onHeightChange,
}) => {
  const { show: showSnackbar } = useSnackbar()

  return (
    <Box data-color-mode="light" height={'100%'} overflow={'hidden'}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={'space-between'}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1">{title}</Typography>
          <Typography variant="caption">(markdown)</Typography>
        </Stack>
        {withUpload && <UserHelp />}
      </Stack>
      <ScrollContainer>
        <ContentEditor
          groupScope={groupScope}
          readOnly={readOnly}
          editorProps={{
            ...defaultEditorOptions,
            preview: readOnly ? 'preview' : 'live',
          }}
          previewOptions={previewOptions}
          commands={readOnly ? [] : mainCommands}
          extraCommands={extraCommands}
          withUpload={!readOnly && withUpload}
          content={rawContent}
          onChange={onChange}
          onHeightChange={onHeightChange}
          onError={(error) => showSnackbar(error, 'error')}
        />
      </ScrollContainer>
    </Box>
  )
}

const ContentEditor = ({
  groupScope,
  withUpload = false,
  readOnly,
  editorProps,
  previewOptions,
  commands,
  extraCommands,
  content: initial,
  onChange,
  onHeightChange,
  onError,
}) => {
  const ref = useRef(null)

  const [content, setContent] = useState(initial)

  const [uploadStatus, setUploadStatus] = useState('NOT_STARTED')

  useEffect(() => {
    setContent(initial)
  }, [initial])

  useEffect(() => {
    if (onHeightChange && ref.current && ref.current.container) {
      const previewElement =
        ref.current.container.querySelector('.wmde-markdown')
      const toolbarElement = ref.current.container.querySelector(
        '.w-md-editor-toolbar',
      )
      if (previewElement) {
        const previewHeight = previewElement.clientHeight
        const toolbarHeight = toolbarElement ? toolbarElement.clientHeight : 0
        onHeightChange(previewHeight + toolbarHeight + 24)
      }
    }
  }, [content, onHeightChange])

  const handleChange = useCallback(
    (value) => {
      setContent(value)
      onChange(value)
    },
    [onChange],
  )

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

  const insertImageInEditor = useCallback(
    (imageUrl, imageName) => {
      const markdownImageSyntax = `![${imageName}](${imageUrl})`
      insertTextAtCursor(markdownImageSyntax)
    },
    [insertTextAtCursor],
  )

  const insertDocumentLinkInEditor = useCallback(
    (fileUrl, fileName) => {
      const markdownLinkSyntax = `[${fileName}](${fileUrl})`
      insertTextAtCursor(markdownLinkSyntax)
    },
    [insertTextAtCursor],
  )

  const handlePaste = useCallback(
    async (e) => {
      if (!groupScope) return

      const items = e.clipboardData.items

      for (const item of items) {
        if (item.kind !== 'file') continue

        setUploadStatus('RUNNING')

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
        setUploadStatus('NOT_STARTED')
      }
    },
    [groupScope, onError, insertImageInEditor, insertDocumentLinkInEditor],
  )

  return (
    <Stack position={'relative'} height={'100%'}>
      <UploadingStatus status={uploadStatus} />
      <MDEditor
        ref={ref}
        value={content}
        {...editorProps}
        previewOptions={previewOptions}
        commands={commands}
        extraCommands={extraCommands}
        onChange={handleChange}
        onPaste={withUpload ? handlePaste : undefined}
        textareaProps={{
          placeholder: 'Markdown content...',
          disabled: readOnly,
        }}
      />
    </Stack>
  )
}

const UploadingStatus = ({ status = 'NOT_STARTED' }) => {
  return status !== 'NOT_STARTED' ? (
    <Overlay>
      <StatusDisplay status={status} size={40} />
    </Overlay>
  ) : null
}

const UserHelp = () => {
  return (
    <UserHelpPopper label="Guide" maxHeight={500}>
      <Stack spacing={1}>
        <Typography variant="h6">File upload</Typography>
        <Typography variant="body1">
          You can paste images and documents directly into the editor
        </Typography>
        <Alert severity="warning">
        <Typography variant="body2" color="main.warning">
            The original file name is kept. Name your files meaningfully
             before pasting them. Eventual existing files will be
            overwritten. The files are organized per group.
        </Typography>
        </Alert>
        <Box>
          <Typography variant="body2">
            Supported document types: pdf, doc, docx, xls, xlsx, ppt, pptx, csv,
            zip, rar, tar
          </Typography>
          <Typography variant="body2">
            Supported image types: jpeg, png, gif, bmp, tiff, webp
          </Typography>
          <Typography variant="body2">
            Supported text types: plain, csv
          </Typography>
          
          <Typography variant="body2">Max file size: 10MB</Typography>
        </Box>

        <Typography variant="h6">Mermaid diagrams support</Typography>
        <Typography variant="body1">
          You can use mermaid syntax to render diagrams
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2">
            Diagrams must be enclosed in triple backticks (code bloc)
          </Typography>
          <TextField
            variant="outlined"
            label="Mermaid diagram example"
            value={mermaidExample}
            fullWidth
            multiline
            rows={7}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />

          <TextField
            variant="outlined"
            label="Mermaid diagram example 2"
            value={mermaidExample2}
            fullWidth
            multiline
            rows={12}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />

          <Typography variant="body2">
            Supported diagram types: flowchart, sequence, class, state, gantt,
            pie, entity relationship etc..
          </Typography>
        </Stack>
        <Stack spacing={1} direction={'row'} alignItems={'center'}>
          <Typography variant="body1">More info: </Typography>
          <Link href="https://mermaid.js.org/intro/#flowchart" target="_blank">
            Diagram types
          </Link>
        </Stack>

        <Typography variant="h6">Latex support</Typography>
        <Typography variant="body1">
          You can use latex syntax to render mathematical formulas
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2">
            Formulas must be enclosed in double dollar signs ($$)
          </Typography>
          <TextField
            variant="outlined"
            label="Latex formula example"
            value={latexExample}
            fullWidth
            multiline
            rows={3}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />
        </Stack>
        <Stack spacing={1} direction={'row'} alignItems={'center'}>
          <Typography variant="body1">More info: </Typography>
          <Link href="https://katex.org/docs/supported" target="_blank">
            Supported symbols
          </Link>
        </Stack>
      </Stack>
    </UserHelpPopper>
  )
}

export default MarkdownEditor