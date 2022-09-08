import { useState, useEffect } from 'react';

import { Stack } from "@mui/material"
import CodeEditor from './CodeEditor';

import Row from '../../layout/Row';

const Code = ({ code:initial, mode = "full", editorHeight = '100%', rightEditorLabel, onChange }) => {

    const [ code, setCode ] = useState();

    useEffect(() => {
        if (initial) {
            setCode(initial);
        }
    }, [initial]);
 
    return (
        <>
            {code && (
                <Row align="flex-start" padding={0}>
                {mode === "full" && (
                    <CodeEditor 
                        label="Solution Code"
                        subheader="Not visible for students."
                        editorHeight={editorHeight}
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
                    label={rightEditorLabel && rightEditorLabel.label ? rightEditorLabel.label : undefined}
                    subheader={rightEditorLabel && rightEditorLabel.subheader? rightEditorLabel.subheader : undefined}
                    editorHeight={editorHeight}
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
            
            

        </>
    )
}



export default Code;