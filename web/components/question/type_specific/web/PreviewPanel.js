import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

const PreviewPanel = ({ id, web }) => {

    const theme = useTheme();

    const frame = useRef();

  
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
        };

        iframe.src = blobUrl;  // Update the iframe's content
        }
    };

    useEffect(() => {
        if (frame.current) {
            frame.current.src = 'about:blank';  // Reset iframe content
            updateIframeContent();
        }
    }, [id, web]);

    return (
        <Box height="100%" padding={2} position={"relative"}>
            <iframe ref={frame} style={{ width: '100%', minHeight:'100%', border: 'none', background: theme.palette.background.paper }} />
        </Box>
    );
}

export default PreviewPanel
  