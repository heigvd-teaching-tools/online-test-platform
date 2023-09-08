import {DatabaseQueryOutputStatus} from "@prisma/client";
import {Box, Chip, Stack, Step, StepConnector, StepLabel, Stepper, Typography} from "@mui/material";
import OutputStatusDisplay from "./OutputStatusDisplay";
import React from "react";

const QueriesRunSummary = ({ queries, studentOutputs }) => {

    const getStatus =  (query, output) => {
        if(!output) return null;
        let status = output.output.status;
        if(status !== DatabaseQueryOutputStatus.RUNNING && status !== DatabaseQueryOutputStatus.ERROR){
            if(query.testQuery){
                status = output.output.testPassed ? DatabaseQueryOutputStatus.SUCCESS : DatabaseQueryOutputStatus.WARNING;
            }
        }
        return status;
    }

    return(
        <Stepper activeStep={1}>
            {queries?.length > 0 && queries.map((q, index) => (
                    <>
                        <Step completed={studentOutputs[index]?.output?.status === DatabaseQueryOutputStatus.SUCCESS}>

                            <StepLabel>
                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    <Chip
                                        icon={<Typography variant={"caption"}>#{q.order}</Typography>}
                                        label={
                                            <Box pt={0.5}>
                                                <OutputStatusDisplay status={getStatus(q, studentOutputs[index])} />
                                            </Box>
                                        } />
                                </Stack>
                            </StepLabel>

                        </Step>
                        <StepConnector />
                    </>
                )
            )}
        </Stepper>
    )
}

export default QueriesRunSummary;
