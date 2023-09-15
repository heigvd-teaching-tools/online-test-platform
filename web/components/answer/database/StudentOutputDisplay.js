import React, {useEffect, useRef, useState} from "react";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QueryOutput from "../../question/type_specific/database/QueryOutput";
import {AlertTitle, Box, Breadcrumbs, Typography} from "@mui/material";
import DateTimeAgo from "../../feedback/DateTimeAgo";
import AlertFeedback from "../../feedback/AlertFeedback";
import { DatabaseQueryOutputStatus, DatabaseQueryOutputTest } from "@prisma/client";

const StudentOutputDisplay = ({ order, testQuery, queryOutputTests, lintResult, studentOutput, solutionOutput}) => {

    const subheaderRef = useRef(null);

    const [ height, setHeight ] = useState(0);

    const [ leftHeight, setLeftHeight ] = useState(0);
    const [ rightHeight, setRightHeight ] = useState(0);

    useEffect(() => setHeight(Math.max(leftHeight, rightHeight) + subheaderRef.current?.getBoundingClientRect().height), [leftHeight, rightHeight])

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
                subheader={
                    <Box ref={subheaderRef}>
                        <StudentTestFeedback
                            order={order}
                            color={getTestColor(studentOutput)}
                            queryOutputTests={queryOutputTests}
                            studentOutput={studentOutput}
                        />
                    </Box>
                }
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


const queryOutputTestToName = {
    [DatabaseQueryOutputTest.IGNORE_COLUMN_ORDER]: "Ignore column order",
    [DatabaseQueryOutputTest.IGNORE_ROW_ORDER]: "Ignore row order",
    [DatabaseQueryOutputTest.IGNORE_EXTRA_COLUMNS]: "Ignore extra columns",
    [DatabaseQueryOutputTest.INGORE_COLUMN_TYPES]: "Ignore types",
}

const StudentTestFeedback = ({ order, color, queryOutputTests, studentOutput }) => {

    const getTestFeedback = (order, studentOutput) => {
        const testPassed = studentOutput?.output.testPassed;
        if(testPassed === null) return "Running test...";
        return testPassed ? `Test for query #${order} passed!` : `Test for query #${order} failed!`;
    }

    return (
        studentOutput && (
            <AlertFeedback severity={color}>
                <AlertTitle>
                    {getTestFeedback(order, studentOutput)}
                </AlertTitle>
                {queryOutputTests.length > 0 && (
                    <Breadcrumbs separator="-" aria-label="breadcrumb">
                        { queryOutputTests.map(({test}, index) => (
                            <Typography key={index} variant={"caption"}>{queryOutputTestToName[test]}</Typography>
                        ))}
                    </Breadcrumbs>
                )}
            </AlertFeedback>
        )
    )
}

export default StudentOutputDisplay;
