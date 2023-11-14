import React, {useState, useCallback, useEffect} from 'react';
import deburr from 'lodash/deburr';
import { Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import StatusDisplay from "../feedback/StatusDisplay";
import { useDebouncedCallback } from "use-debounce";

const illegalGroupScopes = ['groups', 'api', 'users'];
const generateScope = (label) => {
    return deburr(label)
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Keep single hyphens
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .toLowerCase()
        .replace(/-+/g, '-')            // Replace multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, '');       // Remove hyphens at the start or end
};

const getLabelCheckStatus = (isLabelAvailable) => {
    if (isLabelAvailable === undefined) {
        return "LOADING";
    }
    return isLabelAvailable ? "SUCCESS" : "ERROR";
};

/*
* Input for the group label with autogenerated scope.
* Create mode: groupId is undefined
* Edit mode: groupId is set
* */
const GroupScopeInput = ({ label: initialLabel, scope: initialScope, groupId = undefined, onChange }) => {
    const [label, setLabel] = useState(initialLabel || '');
    const [scope, setScope] = useState(initialScope || '');
    const [error, setError] = useState();
    // if groupId is set, we assume his own label is available
    const [isLabelAvailable, setIsLabelAvailable] = useState(groupId !== undefined);

    useEffect(() => {
        setLabel(initialLabel);
        setScope(initialScope);
    }, [initialLabel, initialScope]);

    const debounceChange = useDebouncedCallback(onChange, 500);

    const getHelpText = useCallback(() => {
        if (error) {
            return error;
        }
        if (isLabelAvailable === false) {
            return "This group label is already taken";
        }
        return undefined;
    }, [error, isLabelAvailable]);

    const isAvailable = useCallback(async (label, scope) => {
        let url = `/api/groups/check?label=${label}&scope=${scope}`;
        if (groupId) {
            url += `&groupId=${groupId}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return !data.exists;
    }, [groupId]);

    const handleLabelChange = useCallback(async (event) => {
        const value = event.target.value;
        setLabel(value);

        if (value.length < 3) {
            setError("Label must be at least 3 characters long");
            setIsLabelAvailable(undefined);
            return;
        }

        const newScope = generateScope(value);
        setScope(newScope);
        const illegalScope = illegalGroupScopes.includes(newScope);

        if (illegalScope) {
            setError("This group label is not allowed");
            setIsLabelAvailable(undefined);
            return;
        } else {
            setError(undefined);
        }

        const available = await isAvailable(value, newScope);
        setIsLabelAvailable(available);

        debounceChange(value, newScope);

    }, [initialLabel, initialScope, error, isAvailable, debounceChange]);

    return (
        <Stack spacing={1}>
            <TextField
                label="Label"
                value={label}
                onChange={handleLabelChange}
                error={getHelpText() !== undefined}
                helperText={getHelpText()}
                InputProps={{
                    endAdornment: !error && (
                        <InputAdornment position="end">
                            <StatusDisplay status={getLabelCheckStatus(isLabelAvailable)} />
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />
            {scope && (
                <Box>
                    <Typography>The URL of your group will be:</Typography>
                    <Typography variant="body2">
                        {`${window?.location?.origin}/${scope}`}
                    </Typography>
                </Box>
            )}
        </Stack>
    );
};

export default GroupScopeInput;
