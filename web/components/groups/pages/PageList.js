import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';

import LayoutMain from '../../layout/LayoutMain';
import {Box, Button, IconButton, Stack, Typography} from '@mui/material';
import { useSnackbar } from '../../../context/SnackbarContext';
import DataGrid from '../../ui/DataGrid';
import DialogFeedback from '../../feedback/DialogFeedback';

import { Role } from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import MainMenu from "../../layout/MainMenu";
import DateTimeAgo from "../../feedback/DateTimeAgo";
import {useGroup} from "../../../context/GroupContext";
import AlertFeedback from "../../feedback/AlertFeedback";
import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import UserAvatar from "../../layout/UserAvatar";
import AddGroupDialog from "../list/AddGroupDialog";
import AddMemberDialog from "../list/AddMemberDialog";

const PageList = () => {

  const { groups, mutate:mutateGroups } = useGroup();

  const { show: showSnackbar } = useSnackbar();

  const [ selectedGroup, setSelectedGroup ] = useState();

  const [ addGroupDialogOpen, setAddGroupDialogOpen ] = useState(false);
  const [ addMemberDialogOpen, setAddMemberDialogOpen ] = useState(false);


  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);

  const { data:group, error, mutate } = useSWR(
    `/api/groups/${selectedGroup && selectedGroup.id}/members`,
      selectedGroup ? (...args) => fetch(...args).then((res) => res.json()) : null,
  );

  useEffect(() => {
    if (groups && groups.length > 0){
        setSelectedGroup(groups[0]);
    }
  }, [groups]);

  return (
      <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <LayoutMain
            header={
                <Box>
                    <Link href="/questions">
                        <Button startIcon={<ArrowBackIosIcon /> }>
                            Back
                        </Button>
                    </Link>
                </Box>
            }
        >
            <LayoutSplitScreen
                leftPanel={
                <>
                    <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} sx={{ p : 1}}>
                        <Typography variant="h6">My Groups</Typography>
                        <Button onClick={() => setAddGroupDialogOpen(true)}>Create a new group</Button>
                    </Stack>
                    <MyGroupsGrid
                        groups={groups}
                        onSelected={(group) => setSelectedGroup(group)}
                    />
                </>
                }
                rightPanel={
                    group ?
                        <>
                            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} sx={{ p : 1 }}>
                                <Typography variant="h6">Members of {group && group.label}</Typography>
                                <Button onClick={() => setAddMemberDialogOpen(true)}>Add a new member</Button>
                            </Stack>
                            <GroupMembersGrid
                                group={group}
                            />
                        </>
                        :
                        <Stack p={2}>
                            <AlertFeedback severity="info">
                                <Typography variant="body1">Select a group on the left to view its members.</Typography>
                            </AlertFeedback>
                        </Stack>
                }
            />

          <AddGroupDialog
            open={addGroupDialogOpen}
            onClose={() => setAddGroupDialogOpen(false)}
            onSuccess={async () => await mutateGroups()}
          />
        <AddMemberDialog
            group={group}
            open={addMemberDialogOpen}
            onClose={() => setAddMemberDialogOpen(false)}
            onSuccess={async () => await mutate()} // force refresh
        />


        </LayoutMain>
      </Authorisation>
  )
}


const myGroupsGridHeader = {

    actions: {
        label: '',
        width: '80px',
    },
    columns: [
        {
            label: 'Group',
            column: { flexGrow: 1, }
        }
    ]
};
const MyGroupsGrid = ({ groups, onSelected }) => {
    return (
        <Box sx={{ minWidth:'100%', pl:2, pr:2 }}>
            {groups && groups.length > 0 && (
                <DataGrid
                    header={myGroupsGridHeader}
                    items={groups.map(group => ({
                        label: group.label,
                        meta: {
                            key: group.id,
                            onClick: () => onSelected(group),
                            actions:  [(
                                <IconButton key="delete-group" onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();

                                }}>
                                    <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                                </IconButton>
                            )]
                        }
                    }))}
                />
            )}
            {groups && groups.length === 0 && (
                <AlertFeedback severity="info">
                    <Typography variant="body1">You are not a member of any groups.</Typography>
                </AlertFeedback>
            )}
        </Box>
    )
}

const groupMembersGridHeader = {
    actions: {
        label: '',
        width: '80px',
    },
    columns: [
        {
            label: 'Member',
            column: { flexGrow: 1, }
        }]
}

const GroupMembersGrid = ({ group }) => {
    return (
        <Box sx={{ minWidth:'100%', pl:2, pr:2 }}>
            {group && group.members && group.members.length > 0 && (
                <DataGrid
                    header={groupMembersGridHeader}
                    items={group.members.map(member => ({
                        member: <UserAvatar user={member.user} />,
                        meta: {
                            key: member.userId,
                            actions:  [(
                                <IconButton key="delete-group" onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                }}>
                                    <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                                </IconButton>
                            )]
                        }
                    }))}
                />
            )}
            {group && group.members && group.members.length === 0 && (
                <AlertFeedback severity="info">
                    <Typography variant="body1">There are no members in this group.</Typography>
                </AlertFeedback>
            )}
        </Box>
    )
}

export default PageList;
