import {useCallback, useState} from "react";
import {useSession} from "next-auth/react";
import Image from "next/image";
import {Box, Button, Chip, Typography} from "@mui/material";
import DataGrid from "../../ui/DataGrid";
import AlertFeedback from "../../feedback/AlertFeedback";
import DialogFeedback from "../../feedback/DialogFeedback";
import LogoutIcon from '@mui/icons-material/Logout';


const myGroupsGridHeader = {

    actions: {
        label: '',
        width: '40px',
    },
    columns: [
        {
            label: 'Group',
            column: { flexGrow: 1, }
        }, {
            label: '',
            column: { width: '80px', }
        }
    ]
};
const MyGroupsGrid = ({ groups, onSelected, onLeave, onDelete }) => {
    const { data: session } = useSession();

    const [ deleteGroupId, setDeleteGroupId ] = useState(null);

    const leaveGroup = useCallback(async (groupId) => {
        const response = await fetch(`/api/groups/${groupId}/members`, {
            method: 'DELETE',
        });

        if (response.status === 200){
            onLeave && onLeave(groupId);
        }
    }, [onLeave]);

    const deleteGroup = useCallback(async (groupId) => {
        const response = await fetch(`/api/groups/${groupId}`, {
            method: 'DELETE',
        });

        if (response.status === 200){
            onDelete && onDelete(groupId);
        }
    }, [onDelete]);

    const onDeleteGroup = useCallback((groupId) => {
        setDeleteGroupId(groupId);
    }, [setDeleteGroupId]);

    return (
        <Box sx={{ minWidth:'100%', pl:2, pr:2 }}>
            {session && groups && groups.length > 0 && (
                <DataGrid
                    header={myGroupsGridHeader}
                    items={groups.map(group => ({
                        label: group.label,
                        owner: group.createdById === session.user.id ? <Chip label="Owner" variant={"filled"} color={"warning"} /> : <Chip label="Member" variant={"filled"} color={"info"} />,
                        meta: {
                            key: group.id,
                            onClick: () => onSelected(group),
                            collapsedActions: true,
                            actions:  getMyGroupsActions(group, session.user, leaveGroup, onDeleteGroup)
                        }
                    }))}
                />
            )}
            {groups && groups.length === 0 && (
                <AlertFeedback severity="info">
                    <Typography variant="body1">You are not a member of any groups.</Typography>
                </AlertFeedback>
            )}
            <DialogFeedback
                open={deleteGroupId !== null}
                onClose={() => setDeleteGroupId(null)}
                title="Delete Group"
                content="Are you sure you want to delete this group?"
                onConfirm={() => {
                    deleteGroup(deleteGroupId);
                    setDeleteGroupId(null);
                }}
            />
        </Box>
    )
}



const getMyGroupsActions = (group, user, onLeave, onDelete) => {

    const actions = [
        <Button
            key="leave-group"
            startIcon={<LogoutIcon />}
            onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onLeave(group.id);
            }}>
            Leave this group
        </Button>
    ];

    if(group.createdById === user.id){

        actions.push(
            <Button
                key="delete-group"
                startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />}
                onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onDelete(group.id);
                }}>
                Delete this group
            </Button>
        )
    }

    return actions;
}


export default MyGroupsGrid;

