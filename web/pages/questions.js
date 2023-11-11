import React, { useState } from 'react';
import { Role } from "@prisma/client";
import IndexPage from "../components/IndexPage";
import Authorisation from "../components/security/Authorisation";
/*
Needs to be keept for some time for the user to clear the cache

*/

import DialogFeedback from "../components/feedback/DialogFeedback";
import { Stack, Typography } from '@mui/material';
// Import necessary components for the dialog
// (e.g., Material-UI, React Bootstrap, etc., depending on what you use)

const LegacyQuestionPage = () => {
  // State to manage the visibility of the dialog
  const [showDialog, setShowDialog] = useState(true);

  // Handler for when the user confirms the action
  const handleConfirm = () => {
    // Code to clear browser cache or instruct the user to do so
    // ...

    // Hide the dialog
    setShowDialog(false);
  };

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      
        <DialogFeedback
          open={showDialog}
          title="Clear Browser Cache"
          hideCancel
          content={
            <Stack spacing={1}>
              <Typography variant="body2">
                The new version of the app introduce group scoping in the url. This page is not available anymore at this location.
              </Typography>
              <Typography variant="h6">
                Please clear your browser cache so you dont get redirected to this page anymore. If you are
                unsure how to do this, please{' '}
                <a
                  href="https://www.refreshyourcache.com/en/home/"
                  target="_blank"
                  rel="noreferrer"
                >
                  click here
                </a>{' '}
                for instructions.
              </Typography>
              <Typography variant="body2">
                Clicking on "Confirm" below will redirect you to the new location.
               </Typography>
            </Stack>
          }
          onConfirm={handleConfirm}
        />
      

      {/* Render IndexPage only if the dialog has been confirmed */}
      {!showDialog && <IndexPage />}
    </Authorisation>
  );
};

export default LegacyQuestionPage;
