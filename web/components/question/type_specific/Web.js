import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Stack, Box, Tab, Tabs, Typography } from '@mui/material'

import Editor from '@monaco-editor/react'

import Image from 'next/image'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import ResizePanel from '../../layout/utils/ResizePanel'
import {
  ResizeObserverProvider,
  useResizeObserver,
} from '../../../context/ResizeObserverContext'

const Web = ({ id = 'web', readOnly = false, web: initial, onChange }) => {
  
  const [web, setWeb] = useState(initial)

  const [tab, setTab] = useState('html')

  useEffect(() => {
    setWeb(initial)
  }, [initial, id])

  const onProjectChange = useCallback(
    (what, content) => {
      if (content !== web[what]) {
        let newWeb = {
          ...web,
          [what]: content,
        }
        setWeb(newWeb)
        onChange(newWeb)
      }
    },
    [web, onChange]
  )

  return (
    <Stack spacing={1} width="100%" height="100%" position="relative">
      <TabContext value={tab.toString()}>
        <ResizePanel
          leftPanel={
            <Stack sx={{ height: '100%', pb: 2 }}>
              <Tabs
                value={tab}
                onChange={(ev, val) => setTab(val)}
                aria-label="code tabs"
              >
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Image
                        src="/svg/languages/html5.svg"
                        alt="HTML"
                        width={24}
                        height={24}
                      />
                      <Typography variant="caption">HTML</Typography>
                    </Stack>
                  }
                  value={'html'}
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Image
                        src="/svg/languages/css3.svg"
                        alt="CSS"
                        width={24}
                        height={24}
                      />
                      <Typography variant="caption">CSS</Typography>
                    </Stack>
                  }
                  value={'css'}
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Image
                        src="/svg/languages/javascript.svg"
                        alt="JS"
                        width={24}
                        height={24}
                      />
                      <Typography variant="caption">JS</Typography>
                    </Stack>
                  }
                  value={'js'}
                />
              </Tabs>
              <ResizeObserverProvider>
                <TabPanel id="html" value={'html'}>
                  <EditorSwitchWrapper
                    id={`${id}-html`}
                    readOnly={readOnly}
                    language="html"
                    value={web?.html}
                    onChange={(content) => {
                      onProjectChange('html', content)
                    }}
                  />
                </TabPanel>
                <TabPanel id="css" value={'css'}>
                  <EditorSwitchWrapper
                    id={`${id}-css`}
                    readOnly={readOnly}
                    language="css"
                    value={web?.css}
                    onChange={(css) => onProjectChange('css', css)}
                  />
                </TabPanel>
                <TabPanel id="js" value={'js'}>
                  <EditorSwitchWrapper
                    id={`${id}-js`}
                    readOnly={readOnly}
                    language="javascript"
                    value={web?.js}
                    onChange={(js) => onProjectChange('js', js)}
                  />
                </TabPanel>
              </ResizeObserverProvider>
            </Stack>
          }
          rightPanel={
            <PreviewPanel id={`${id}-preview`} web={web} />
          }
        />
      </TabContext>
    </Stack>
  )
}

const EditorSwitchWrapper = ({ value, language, readOnly, onChange }) => {
  const { height: containerHeight } = useResizeObserver()
  return (
    <Editor
      width="100%"
      height={`${containerHeight}px`}
      options={{ readOnly }}
      language={language}
      value={value || ''}
      onChange={onChange}
    />
  )
}

const PreviewPanel = ({ id, web }) => {
  const frame = useRef();

  const updateIframeHeight = () => {
    if (frame.current) {
      const doc = frame.current.contentDocument || frame.current.contentWindow.document;
      frame.current.style.height = `${doc.documentElement.offsetHeight}px`;
    }
  };

  const updateIframeContent = () => {
    if (web && frame.current) {
      let iframe = frame.current;

      let html = web.html || '';
      let css = web.css || '';
      let js = web.js || '';

      let fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            ${css}
          </style>
        </head>
        <body style="margin:0;">
          ${html}
          <script>${js}</script>
        </body>
        </html>
      `;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      iframe.onload = () => {
        URL.revokeObjectURL(blobUrl);  // Release the Blob URL to free up resources
        // Use a timeout to give scripts inside the iframe, if any, some time to run
        setTimeout(updateIframeHeight, 100);
      };

      iframe.src = blobUrl;  // Update the iframe's content
    }
  };

  useEffect(() => {
    if (frame.current) {
      frame.current.src = 'about:blank';  // Reset iframe
      updateIframeContent();
    }
  }, [id, web]);

  return (
    <Box height="100%" padding={2}>
      <iframe ref={frame} style={{ width: '100%', border: 'none', background: 'white' }} />
    </Box>
  );
}



export default Web
