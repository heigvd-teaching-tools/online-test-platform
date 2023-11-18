import React, { useState } from 'react';
import { Role } from "@prisma/client";
import IndexPage from "../components/IndexPage";
import Authorisation from "../components/security/Authorisation";
/*
Needs to be keept for some time for the user to clear the cache
TODO : REMOVE THIS PAGE in february 2024
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
                    We've updated our app to include group scoping in the URL. As a result, this page's location has changed.
                </Typography>
                <Typography variant="body2">
                    To ensure a smooth transition and avoid unnecessary redirections, <b>please clear your browser cache</b>. 
                </Typography>
                <Typography variant="body2">
                 If you need guidance on how to do this:  
                    <a
                        href="https://www.refreshyourcache.com/en/home/"
                        target="_blank"
                        rel="noreferrer"
                    >
                    click here for step-by-step instructions.
                    </a>
                    
                </Typography>
                <Typography variant="body2">
                    Once you click "Confirm" below, you'll be redirected to the new page location.
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
