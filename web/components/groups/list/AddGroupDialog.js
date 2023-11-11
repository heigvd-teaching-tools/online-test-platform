import {useGroup} from "../../../context/GroupContext";
import {useSnackbar} from "../../../context/SnackbarContext";
import {useCallback, useState} from "react";
import DialogFeedback from "../../feedback/DialogFeedback";
import {Stack} from "@mui/material";
import GroupScopeInput from "../../input/GroupScopeInput ";

const AddGroupDialog = ({ open, selectOnCreate, onClose, onSuccess }) => {
    const { mutate: mutateGroups } = useGroup();
    const { showAt: showSnackbarAt } = useSnackbar();

    const [label, setLabel] = useState('');
    const [scope, setScope] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGroupScopeChange = (newLabel, newScope) => {
        setLabel(newLabel);
        setScope(newScope);
    };

    const handleAddGroup = useCallback(async () => {
        setIsSubmitting(true);
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
        });
        const data = await response.json();
        setIsSubmitting(false);

        if (response.status === 200) {
            mutateGroups && mutateGroups();
            onSuccess && onSuccess(data);
        } else {
            showSnackbarAt(
                { vertical: 'bottom', horizontal: 'center' },
                data.message,
                'error'
            );
        }
    }, [label, scope, selectOnCreate, showSnackbarAt, mutateGroups, onSuccess]);

    return (
        <DialogFeedback
            open={open}
            onClose={onClose}
            title="Create a new group"
            content={
                <Stack spacing={2} mt={1} minWidth={300}>
                    <GroupScopeInput
                        label={label}
                        scope={scope}
                        onChange={handleGroupScopeChange}
                    />
                </Stack>
            }
            onConfirm={handleAddGroup}
            confirmButtonProps={{
                disabled: isSubmitting || !label || !scope
            }}
        />
    );
};

export default AddGroupDialog;
