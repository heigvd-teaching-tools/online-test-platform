import React, {useEffect, useState} from "react";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QueryOutput from "../../question/type_specific/database/QueryOutput";
import {Typography} from "@mui/material";

const StudentOutputVizualisation = ({ color, testQuery, studentOutput, solutionOutput}) => {

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
                            <Typography variant={"caption"}>
                                Your output
                            </Typography>
                        }
                        color={color}
                        showAgo
                        queryOutput={studentOutput}
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
                        queryOutput={solutionOutput}
                        onHeightChange={(newHeight) => {
                            setRightHeight(newHeight)
                        }}
                    />
                }
            />
        ) : (
            <QueryOutput
                queryOutput={studentOutput}
                color={"info"}
            />
        )
    )
}

export default StudentOutputVizualisation;
