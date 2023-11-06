import { Stack, Typography } from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"
import InlineMonacoEditor from "../../../input/InlineMonacoEditor"
import { useTheme } from "@emotion/react"

const WebEditor = ({ id = "web", title, readOnly = false, web: initial, onChange }) => {

  const [ web, setWeb ] = useState(initial);

  useEffect(() => setWeb(initial), [initial, id])

  return (
    <Stack spacing={0} pt={0} position={"relative"} pb={24}>
      { title && (
        <Stack p={1}>
          <Typography variant="body1">{title}</Typography>
        </Stack>
      )}
      
      <WebEditorInput
        id={`html`}
        language={"html"}
        code={web?.html || ''}
        readOnly={readOnly}
        onChange={(code) => {
          const newWeb = { ...web, html: code }
          setWeb(newWeb)
          onChange && onChange(newWeb)
        }}
      />
      <WebEditorInput
        id={`css`}
        language={"css"}
        code={web?.css || ''}
        readOnly={readOnly}
        onChange={(code) => {
          const newWeb = { ...web, css: code }
          setWeb(newWeb)
          onChange && onChange(newWeb)
        }}
      />
      <WebEditorInput
        id={`js`}
        language={"javascript"}
        code={web?.js || ''}
        readOnly={readOnly}
        onChange={(code) => {
          const newWeb = { ...web, js: code }
          setWeb(newWeb)
          onChange && onChange(newWeb)
        }}
      />
    </Stack>
  )

}

const WebEditorInput = ({ language, code:initial, readOnly, onChange }) => {
  
  const theme = useTheme()

  const [ code, setCode ] = useState(code)

  useEffect(() => setCode(initial || ''), [initial])

  return (
    <Stack spacing={1} position={"relative"}>
      <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1} 
          
          p={1} 
          pt={2}
          position={"sticky"} 
          top={0}
          zIndex={1}
          bgcolor={theme.palette.background.paper}
      >
          <Image
            src={`/svg/languages/${language}.svg`}
            alt="HTML"
            width={24}
            height={24}
          />
          <Typography variant="button">{language}</Typography>
      </Stack>
      <InlineMonacoEditor
        width="100%"
        options={{ readOnly }}
        language={language}
        code={code}
        readOnly={readOnly}
        onChange={(content) => onChange(content)}
      />
    </Stack>
  )
}



export default WebEditor