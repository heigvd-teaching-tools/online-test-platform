import React, {useEffect, useState} from "react";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QueryOutput from "../../question/type_specific/database/QueryOutput";
import {Typography} from "@mui/material";
import DateTimeAgo from "../../feedback/DateTimeAgo";

const StudentOutputDisplay = ({ testQuery, lintResult, studentOutput, solutionOutput}) => {

    const [ height, setHeight ] = useState(0);

    const [ leftHeight, setLeftHeight ] = useState(0);
    const [ rightHeight, setRightHeight ] = useState(0);

    useEffect(() => setHeight(Math.max(leftHeight, rightHeight)), [leftHeight, rightHeight]);

    const hasTestPassed = (studentOutput) => {
        return studentOutput?.output.testPassed;
    }

    const getTestColor = (studentOutput) => {
        if(!studentOutput) return "info"; // no student output yet -> we display solution output in blue
        const testPassed = hasTestPassed(studentOutput);
        if(testPassed === null) return "info"; // test is running -> we display student output in blue
        // test is finished, we display student output in success if test passed, warning if fail and error if query failed to run
        return testPassed ? "success" : studentOutput.status === DatabaseQueryOutputStatus.ERROR ? "error" : "warning";
    }

    return (
        testQuery ? (
            <LayoutSplitScreen
                useScrollContainer={false}
                height={`${height}px`}
                leftPanel={
                    <QueryOutput
                        header={
                            <>
                                <Typography variant={"caption"}>
                                    Your output
                                </Typography>
                                <Typography variant={"caption"}>Last run:</Typography>
                                {studentOutput?.updatedAt && <DateTimeAgo date={new Date(studentOutput.updatedAt)} />}
                            </>
                        }
                        color={getTestColor(studentOutput)}
                        result={studentOutput?.output}
                        lintResult={lintResult}
                        onHeightChange={(newHeight) => {
                            setLeftHeight(newHeight);
                        }}
                    />
                }
                rightWidth={50}
                rightPanel={
                    <QueryOutput
                        header={
                            <Typography variant={"caption"}>
                                Expected output
                            </Typography>
                        }
                        color={getTestColor(studentOutput)}
                        result={solutionOutput.output}
                        onHeightChange={(newHeight) => {
                            setRightHeight(newHeight)
                        }}
                    />
                }
            />
        ) : (
            <QueryOutput
                result={studentOutput?.output}
                color={"info"}
            />
        )
    )
}

export default StudentOutputDisplay;
