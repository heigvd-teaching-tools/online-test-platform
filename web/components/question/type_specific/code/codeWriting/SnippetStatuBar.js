import React from 'react';
import { Step, StepConnector, StepLabel, Stepper, Stack } from '@mui/material';
import StatusDisplay from '@/components/feedback/StatusDisplay';

const SnippetStatuBar = ({ statuses }) => {
    return (
      <Stepper activeStep={-1}>
            {statuses?.length > 0 &&
              statuses.map((status, index) => (
                <React.Fragment key={`status-${index}`}>
                  <Step
                    completed={true}
                  >
                    <StepLabel>
                      <Stack
                        direction={'row'}
                        spacing={1}
                        alignItems={'center'}
                        height={20}
                      >
                        <StatusDisplay status={status} />
                      </Stack>
                    </StepLabel>
                  </Step>
                  <StepConnector />
                </React.Fragment>
              ))}
          </Stepper>
    )
} 

export default SnippetStatuBar;