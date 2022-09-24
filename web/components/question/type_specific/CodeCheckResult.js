import { Typography, TextareaAutosize, Box, Collapse} from "@mui/material";

import Row from '../../layout/utils/Row';
import Column from '../../layout/utils/Column';
import AlertFeedback from '../../feedback/AlertFeedback';
import ResizePanel from "../../layout/utils/ResizePanel";

const CodeCheckResult = ({ result, collapsible = false }) => {

    return (
        <Box>
<Row>
    <Column flexGrow={1}>
        <AlertFeedback severity={result.success ? "success" : "error"}>{result.success ? "Test Successful" : "Test Failed"}</AlertFeedback>
    </Column>
</Row>
<ResizePanel
    leftPanel={
        <>
        <Typography variant="h6">Expected Result</Typography>
        <TextareaAutosize 
            value={result.expected}
            style={{ 
                width: '100%', 
                overflow: 'auto', 
                overflowY: 'hidden',
                whiteSpace: 'pre',
                resize: 'none'
            }}
        /></>
    }
    rightPanel={
        <>
        <Typography variant="h6">Your Result</Typography>
        <TextareaAutosize
            value={result.result}
            style={{ 
                width: '100%', 
                overflow: 'auto', 
                overflowY: 'hidden',
                whiteSpace: 'pre',
                resize: 'none'
            }}
        /></>
    }
/>
</Box>

    )
}


export default CodeCheckResult;