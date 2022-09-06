import { useState, useEffect } from 'react';

import { Stack } from "@mui/material"
import CodeEditor from './CodeEditor';

import Row from '../../layout/Row';

const Code = ({ code:initial, mode = "full", rightEditorLabel, onChange }) => {

    const [ code, setCode ] = useState();

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial]);
 
    return (
        <Stack direction="column" spacing={2}>
            {code && (
                <Row align="flex-start" padding={0}>
                {mode === "full" && (
                    <CodeEditor 
                        label="Solution Code"
                        subheader="Not visible for students."
                        code={initial.solution}
                        onChange={(newCode) => {
                            setCode({
                                ...code,
                                solution: newCode
                            });
                            if(onChange) onChange("solution", newCode);
                        }}
                    /> 
                )}
                
                <CodeEditor 
                    label={rightEditorLabel.label}
                    subheader={rightEditorLabel.subheader}
                    code={initial.code}
                    onChange={(newCode) => {
                        setCode({
                            ...code,
                            code: newCode
                        });
                        if(onChange) onChange("code", newCode);
                    }}
                /> 
            </Row>
            )}
            
            

        </Stack>
    )
}



export default Code;