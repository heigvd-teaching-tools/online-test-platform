import {DatabaseQueryOutputStatus} from "@prisma/client";
import {Box, Chip, Stack, Step, StepConnector, StepLabel, Stepper, Typography} from "@mui/material";
import StatusDisplay from "../../feedback/StatusDisplay";
import React from "react";

const QueriesRunSummary = ({ queries, studentOutputs }) => {

    const getStatus =  (query, output) => {
        if(!output) return null;
        if(!query.testQuery) {
            // status can be either "RUNNING" or "ERROR", otherwise it's "NEUTRAL"
            const acceptedStatuses = [DatabaseQueryOutputStatus.RUNNING, DatabaseQueryOutputStatus.ERROR];
            if(acceptedStatuses.includes(output.output.status)) return output.output.status;
        }else{
            // status can be either "RUNNING", "ERROR"
            // status is "WARNING" if testPassed is false
            // status is "SUCCESS" if testPassed is true
            const acceptedStatuses = [DatabaseQueryOutputStatus.RUNNING, DatabaseQueryOutputStatus.ERROR];
            if(acceptedStatuses.includes(output.output.status)) return output.output.status;
            if(output.output.testPassed === true) return DatabaseQueryOutputStatus.SUCCESS;
            if(output.output.testPassed === false) return DatabaseQueryOutputStatus.WARNING;
        }
        return DatabaseQueryOutputStatus.NEUTRAL;
    }

    return(
        <Stepper activeStep={1}>
            {queries?.length > 0 && queries.map((q, index) => (
                <React.Fragment key={`query-${q.id}`}>
                    <Step completed={studentOutputs[index]?.output?.status === DatabaseQueryOutputStatus.SUCCESS}>
                        <StepLabel>
                            <Stack direction={"row"} spacing={1} alignItems={"center"} height={30}>
                                <StatusDisplay status={getStatus(q, studentOutputs[index])} />
                            </Stack>
                        </StepLabel>

                    </Step>
                    <StepConnector />
                </React.Fragment>
                )
            )}
        </Stepper>
    )
}

export default QueriesRunSummary;
