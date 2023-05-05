import {useState} from "react";
import {Stack, Tab, Tabs, TextField, Typography} from "@mui/material";

const TestCaseResults = ({ tests }) => {
    const [index, setIndex] = useState(0);
    return(
        <Stack spacing={1} direction="row" pb={2} flex={1}>
            {tests?.length > 0 && (
                <>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={index}
                        onChange={(e, i) => setIndex(i)}
                    >
                        {tests?.map((t, i) =>
                            <Tab
                                key={i}
                                label={<Typography sx={{ color: (t.passed ? "success.main" : "error.main") }}>
                                    { "Test Case " + (i+1) }
                                </Typography>
                                } value={i}
                            />
                        )}
                    </Tabs>
                    <TestCaseResult result={tests[index]} />
                </>
            )}

        </Stack>
    )
}


const TestCaseResult = ({ result }) => {

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


export default TestCaseResults;
