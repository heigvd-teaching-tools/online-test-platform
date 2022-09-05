import { Stack } from "@mui/material"
import CodeEditor from './CodeEditor';

import Row from '../../layout/Row';

const Code = ({ code:initial, mode = "full", onChange }) => {
    return (
        <Stack direction="column" spacing={2}>
            <Row align="flex-start" padding={0}>
                {mode === "full" && (
                    <CodeEditor 
                        label="Solution Code"
                        subheader="Not visible for students."
                        code={initial.solution}
                        onChange={(newCode) => {
                            initial.solution = newCode;
                        }}
                    /> 
                )}
                
                <CodeEditor 
                    label="Partial Code"
                    subheader="Provided to students"
                    code={initial.code}
                    onChange={(newCode) => {
                        initial.code = newCode;
                        if(onChange) onChange(initial);
                    }}
                /> 
            </Row>
            

        </Stack>
    )
}



export default Code;