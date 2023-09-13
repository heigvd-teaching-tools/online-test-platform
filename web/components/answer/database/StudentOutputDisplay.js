import React, {useEffect, useState} from "react";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QueryOutput from "../../question/type_specific/database/QueryOutput";
import {Typography} from "@mui/material";
import DateTimeAgo from "../../feedback/DateTimeAgo";

const StudentOutputDisplay = ({ color, testQuery, lintResult, studentOutput, solutionOutput}) => {

    const [ height, setHeight ] = useState(0);

    const [ leftHeight, setLeftHeight ] = useState(0);
    const [ rightHeight, setRightHeight ] = useState(0);

    useEffect(() => setHeight(Math.max(leftHeight, rightHeight)), [leftHeight, rightHeight]);

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
                        color={color}
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
                        color={color}
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
