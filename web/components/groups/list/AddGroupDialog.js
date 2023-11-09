import React, { useState, useCallback, useEffect } from 'react';
import deburr from 'lodash/deburr';
import DialogFeedback from "../../feedback/DialogFeedback";
import { InputAdornment, Stack, TextField, Typography} from "@mui/material";
import {useSnackbar} from "../../../context/SnackbarContext";
import StatusDisplay from "../../feedback/StatusDisplay";
import {useGroup} from "../../../context/GroupContext";

const AddGroupDialog = ({ open, selectOnCreate, onClose, onSuccess }) => {

    const { mutate: mutateGroups } = useGroup();

    const { showAt: showSnackbarAt } = useSnackbar();
    const [label, setLabel] = useState('');
    const [error, setError] = useState();
    const [scope, setScope] = useState('');
    const [isLabelAvailable, setIsLabelAvailable] = useState(false);

    useEffect(() => {
        if(label.length < 3) {
            setError("Label must be at least 3 characters long");
            return
        } else {
            setError(undefined);
        }
        (async () => {
            const available = await isAvailable();
            setIsLabelAvailable(available);
        })();
    }, [label]);

    const isAvailable = useCallback(async () => {
        const response = await fetch(`/api/groups/check?label=${label}&scope=${scope}`);
        const data = await response.json();
        return !data.exists;
    }, [label, scope]);

    const getLabelCheckStatus = (isLabelAvailable) => {
        if(isLabelAvailable === undefined) {
            return "LOADING";
        }
        return isLabelAvailable ? "SUCCESS" : "ERROR";
    }

    const generateScope = (label) => {
        const sanitizedLabel = deburr(label)
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with -
            .toLowerCase()
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
        return sanitizedLabel;
    };


    const handleAddGroup = useCallback(
    async () => {

        if(error || !isLabelAvailable) {
            showSnackbarAt(
                { vertical: 'bottom', horizontal: 'center' },
                "Please fix the errors before submitting",
                'error'
            )
            return;
        }
          const response = await fetch(`/api/groups`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              label,
              scope,
              select: selectOnCreate,
            }),
          })
          const data = await response.json()

          if (response.status === 200) {
                mutateGroups && mutateGroups();
                onSuccess && onSuccess(data);
          } else {
            showSnackbarAt(
              { vertical: 'bottom', horizontal: 'center' },
              data.message,
              'error'
            )
          }
    },
    [label, scope, selectOnCreate, error, isLabelAvailable, showSnackbarAt, mutateGroups, onSuccess]
  )

  return (
      <DialogFeedback
          open={open}
          onClose={onClose}
          title={`Create a new group`}
          content={
              <Stack spacing={2} mt={1} minWidth={300}>
                  <TextField
                      label="Label"
                      value={label}
                      onChange={(e) => {
                          const value = e.target.value;
                          setError(undefined)
                          setIsLabelAvailable(undefined)
                          setLabel(value)
                          setScope(generateScope(value))
                      }}
                      error={error}
                      helperText={error}
                      InputProps={{
                            endAdornment:
                                !error &&
                                <InputAdornment position="end">
                                    <StatusDisplay status={getLabelCheckStatus(isLabelAvailable)} />
                                </InputAdornment>,
                      }}
                      fullWidth
                  />
                  {scope && (
                      <>
                      <Typography>
                          The url of your group will be:
                      </Typography>
                      <Typography variant="body2">
                          {`${window?.location?.origin}/${scope}`}
                      </Typography>
                      </>
              )}
              </Stack>
          }
          onConfirm={() => handleAddGroup(label)}
      />
  )
}

export default AddGroupDialog
