import { useState } from 'react';
import DialogFeedback   from "../feedback/DialogFeedback";
import {Stack, TextField} from "@mui/material";
import {useSnackbar} from "../../context/SnackbarContext";
import {useInput} from "../../utils/useInput";
const AddExamDialog = ({ open, onClose, handleAddExam }) => {
    const { show: showSnackbar } = useSnackbar();
    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription } = useInput('');

    const handleAdd = async () => {
        if(label.length === 0){
          setErrorLabel({ error: true, helperText: 'Label is required' });
          return;
        }
        await fetch('/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                description
            })
        })
        .then((res) => {
            res.json().then((data) => {
                if(res.ok) {
                   showSnackbar("Exam created successfully", 'success');
                   onClose();
                   handleAddExam(data);
                } else {
                    showSnackbar(data.message, 'error');
                }
            });
        });
    };

  return (
      <DialogFeedback
        open={open}
        onClose={onClose}
        title="Add Exam"
        content={
            <Stack spacing={2} pt={2} sx={{ width: '500px' }}>
                <TextField
                    label="Label"
                    id="exam-label"
                    fullWidth
                    value={label}
                    {...bindLabel}
                />
                <TextField
                    label="Description"
                    id="exam-desctiption"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    {...bindDescription}
                />
            </Stack>

        }
        onConfirm={handleAdd}
        />

  );
}

export default AddExamDialog;
