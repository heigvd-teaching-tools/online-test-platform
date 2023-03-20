import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Stack, Box, Tab, Tabs, Typography} from "@mui/material"

import Editor from "@monaco-editor/react";

import Image from "next/image";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import ResizePanel from "../../layout/utils/ResizePanel";
import {ResizeObserverProvider, useResizeObserver} from "../../../context/ResizeObserverContext";

const Web = ({ id = "web", readOnly = false, web:initial, onChange }) => {

    const [ web, setWeb ] = useState(initial);

    const [ tab, setTab ] = useState("0");
    useEffect(() => {
        setWeb(initial);
    }, [initial, id]);


    const onProjectChange = useCallback((what, content) => {
        if(content !== web[what]){
            let newWeb = {
                ...web,
                [what]: content
            };
            setWeb(newWeb);
            onChange(newWeb);
        }
    }, [web, onChange]);

    return(
        <Stack spacing={1} width="100%" height="100%" position="relative">
            <TabContext value={tab.toString()}>
            <ResizePanel
                leftPanel={
                <Stack sx={{ height: '100%', pb:2 }}>
                    <Tabs value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Image src="/svg/languages/html5.svg" alt="HTML" width={24} height={24} />
                                    <Typography variant="caption">HTML</Typography>
                                </Stack>
                        }
                            value={"0"}
                        />
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Image src="/svg/languages/css3.svg" alt="CSS" width={24} height={24} />
                                    <Typography variant="caption">CSS</Typography>
                                </Stack>
                            }
                            value={"1"}
                        />
                        <Tab
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Image src="/svg/languages/javascript.svg" alt="JS" width={24} height={24} />
                                    <Typography variant="caption">JS</Typography>
                                </Stack>
                            }
                            value={"2"}
                        />
                    </Tabs>
                    <ResizeObserverProvider>
                    <TabPanel id="html" value={"0"}>
                        <EditorSwitchWrapper
                            id={`${id}-html`}
                            readOnly={readOnly}
                            language="html"
                            value={web?.html}
                            onChange={(content) => {
                                onProjectChange("html", content);
                            }}
                        />
                    </TabPanel>
                    <TabPanel id="css" value={"1"}>
                        <EditorSwitchWrapper
                            id={`${id}-css`}
                            readOnly={readOnly}
                            language="css"
                            value={web?.css}
                            onChange={(css) => onProjectChange("css", css)}
                        />
                    </TabPanel>
                    <TabPanel id="js" value={"2"}>
                        <EditorSwitchWrapper
                            id={`${id}-js`}
                            readOnly={readOnly}
                            language="javascript"
                            value={web?.js}
                            onChange={(js) => onProjectChange("js", js)}
                        />
                    </TabPanel>
                    </ResizeObserverProvider>
                </Stack>
                }
                rightPanel={<PreviewPanel id={`${id}-preview`} web={web} />}
            />
            </TabContext>
        </Stack>
    )
}

const EditorSwitchWrapper = ({ id, value:initial, language, readOnly, onChange }) => {
    const { height: containerHeight } = useResizeObserver();
    const [ value, setValue ] = useState("");
    useEffect(() => {
        setValue(initial);
    }, [id, initial]);

    return <Editor
        width="100%"
        height={`${containerHeight}px`}
        options={{ readOnly }}
        language={language}
        value={value}
        onChange={onChange}
    />
}

const PreviewPanel = ({ id, web }) => {
        let frame = useRef();

        useEffect(() => {

            if (web && frame) {

                let iframe = frame.current;

                let html = web.html || "";
                let css = web.css || "";
                let js = web.js || "";

                let doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.body.innerHTML = "";
                doc.head.innerHTML = "";

                // set css into iframe head
                let style = document.createElement("style");
                style.innerHTML = css;

                doc.head.appendChild(style);

                // set javascript into iframe body
                let script = document.createElement("script");
                script.innerHTML = js;
                doc.body.appendChild(script);

                // set html into iframe body
                doc.body.innerHTML = html;
                doc.body.style.margin = "0";

                iframe.style.width = "100%";
                // set frame height based on content
                iframe.style.height = `${doc.body.scrollHeight}px`;
                iframe.style.border = "none";

            }
        }, [id, web]);

        return <Box height="100%" padding={2} ><iframe ref={frame} /></Box>
}

export default Web;
