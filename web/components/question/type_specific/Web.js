import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Stack, Box, Tab, Tabs} from "@mui/material"

import Editor from "@monaco-editor/react";

import Image from "next/image";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import ResizePanel from "../../layout/utils/ResizePanel";

// TODO : Preview

const Web = ({ id = "web", readOnly = false, web:initial, containerHeight, onChange }) => {

    const [ web, setWeb ] = useState(initial);
    const [ tab, setTab ] = useState(0);
    const [ editorHeight, setEditorHeight ] = useState(0);

    useEffect(() => {
        setWeb(initial);

    }, [initial, id]);

    const tabRef = useCallback(node => {
        if (node !== null) {
            setEditorHeight(containerHeight - node.clientHeight - 50);
        }
    }, [containerHeight]);

    const onProjectChange = useCallback((what, content) => {
        let newWeb = {...web, [what]: content};
        setWeb(newWeb);
        onChange(newWeb);
    }, [web, onChange]);

    return(
        <Stack spacing={1} sx={{ width:'100%', height:'100%', position:'relative' }}>
            <TabContext value={tab}>
            <ResizePanel
                leftPanel={
                <>
                    <Tabs ref={tabRef} value={tab} onChange={(ev, val) => setTab(val)} aria-label="code tabs">
                        <Tab
                            icon={<Box><Image src="/svg/questions/web/html5.svg" alt="HTML" width={24} height={24} /></Box>}
                            iconPosition="start"
                            label="HTML"
                            value={0}
                        />
                        <Tab
                            icon={<Box><Image src="/svg/questions/web/css3.svg" alt="CSS" width={24} height={24} /></Box>}
                            iconPosition="start"
                            label="CSS"
                            value={1}
                        />
                        <Tab
                            icon={<Box><Image src="/svg/questions/web/js.svg" alt="JavaScript" width={24} height={24} /></Box>}
                            iconPosition="start"
                            label="JavaScript"
                            value={2}
                        />
                    </Tabs>
                    <TabPanel id="html" value={0}>
                        <Editor
                            width="100%"
                            height={`${editorHeight}px`}
                            options={{
                                readOnly
                            }}
                            language="html"
                            value={web?.html || ""}
                            onChange={(html) => onProjectChange("html", html)}
                        />
                    </TabPanel>
                    <TabPanel id="css" value={1}>
                        <Editor
                            width="100%"
                            height={`${editorHeight}px`}
                            options={{
                                readOnly
                            }}
                            language="css"
                            value={web?.css || ""}
                            onChange={(css) => onProjectChange("css", css)}
                        />
                    </TabPanel>
                    <TabPanel id="js" value={2}>
                        <Editor
                            width="100%"
                            height={`${editorHeight}px`}
                            options={{
                                readOnly
                            }}
                            language="javascript"
                            value={web?.js || ""}
                            onChange={(js) => onProjectChange("js", js)}
                        />
                    </TabPanel>
                </>
                }
                rightPanel={<PreviewPanel web={web} />}
            />
            </TabContext>
        </Stack>
    )
}

const PreviewPanel = ({ web }) => {
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

                iframe.style.width = "100%";
                // set frame height based on content
                iframe.style.height = `${doc.body.scrollHeight}px`;
                iframe.style.border = "none";
                doc.body.style.margin = "0";
            }
        }, [web, frame]);

        return <Box sx={{ height:'100%' }}><iframe ref={frame} /></Box>
}

export default Web;