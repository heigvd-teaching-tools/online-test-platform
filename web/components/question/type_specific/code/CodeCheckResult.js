import {Typography, TextareaAutosize, Box, Collapse, Stack, TextField, Alert} from "@mui/material";
import AlertFeedback from "../../../feedback/AlertFeedback";


const CodeCheckResult = ({ result, collapsible = false }) => {
/*

    result example:
     {
            "exec": "node /src/main.js",
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3",
            "expectedOutput": "TEST WORLD\nTEST WORLD2\nTEST WORLD3",
            "passed": true
        }



*/
    return (
        result &&
        <Stack spacing={4} p={2} flex={1}>

                <TextField
                    label="Exec"
                    value={result.exec}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    focused
                    color="info"
                    multiline
                    fullWidth
                />


                <TextField
                    label="Input"
                    value={result.input}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    focused
                    color="info"
                    multiline
                    fullWidth
                />
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Output"
                        value={result.output}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="standard"
                        focused
                        color={result.passed ? "success" : "error"}
                        error={!result.passed}
                        multiline
                        fullWidth
                    />

                    <TextField
                        label="Expected Output"
                        value={result.expectedOutput}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="standard"
                        focused
                        color={result.passed ? "success" : "error"}
                        error={!result.passed}
                        multiline
                        fullWidth
                    />
                </Stack>

        </Stack>

    )
}


export default CodeCheckResult;
