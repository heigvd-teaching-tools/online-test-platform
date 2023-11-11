import {useRouter} from "next/router";
import {useGroup} from "../../context/GroupContext";
import {useEffect, useState} from "react";
import Unauthorized from "./Unauthorized";
import {Button, Typography} from "@mui/material";
import {signOut} from "next-auth/react";
import AddGroupDialog from "../groups/list/AddGroupDialog";
const UnauthorizedMissingGroups = () => {
    const router = useRouter()
    const { groups } = useGroup()
    // if the user has no groups, redirect to the index page
    useEffect(() => {
        if(groups?.length === 0) {
            (async () => {
                if (router.pathname !== "/" && router.pathname.includes("[groupScope]")) {
                    await router.push('/')
                }
            })()
        }
    }, [router, groups])

    const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false)
    return (
        <Unauthorized>
            <Typography variant="h6">You are not a member of any groups.</Typography>
            <Button variant={'contained'} onClick={() => setAddGroupDialogOpen(true)}>
                Create a new group
            </Button>
            <Button onClick={() => signOut()} variant="text" color="primary">
                Sign Out
            </Button>
            <AddGroupDialog
                open={addGroupDialogOpen}
                onClose={() => setAddGroupDialogOpen(false)}
                onSuccess={async (group) => {
                    await router.push(`/${group.scope}/questions`)
                }}
            />
        </Unauthorized>
    )
}

export default UnauthorizedMissingGroups
