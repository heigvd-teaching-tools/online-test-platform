import React, {useCallback, useState} from "react";
import DialogFeedback   from "../../feedback/DialogFeedback";
import { Stack, TextField} from "@mui/material";
import {useSnackbar} from "../../../context/SnackbarContext";

const AddGroupDialog = ({ open, selectOnCreate, onClose, onSuccess }) => {
    const { showAt: showSnackbarAt } = useSnackbar();
    const [ label, setLabel ] = useState('');

    const handleAddGroup = useCallback(async (label) => {
        const response = await fetch(`/api/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                label,
                select: selectOnCreate
            })
        });

        if(response.status === 200){
            const group = await response.json();
            onSuccess && onSuccess(group);
        }else{
            const data = await response.json();
            showSnackbarAt({ vertical: 'bottom', horizontal: 'center' }, data.message, 'error');
        }
    }, [onSuccess]);

    return (
      <DialogFeedback
        open={open}
        onClose={onClose}
        title={`Create a new group`}
        content={
          <Stack spacing={2} mt={1}>
                <TextField
                    label="Label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    fullWidth
                />
          </Stack>

        }
        onConfirm={() => handleAddGroup(label)}
        />

    );
}

export default AddGroupDialog;
