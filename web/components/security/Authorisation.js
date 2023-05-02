import {signOut, useSession  } from "next-auth/react";
import {Role} from "@prisma/client";
import Unauthorized from "./Unauthorized";
import {Button, Typography} from "@mui/material";
import AddGroupDialog from "../groups/list/AddGroupDialog";
import {useEffect, useState} from "react";
import {useGroup} from "../../context/GroupContext";

const Authorisation = ({ children, allowRoles = [] }) => {

    const { data: session } = useSession()
    const { mutate } = useGroup();

    const [ authorization, setAuthorization ] = useState({
        hasRole: false,
        hasGroups: false
    });

    useEffect(() => {
        if(session?.user){
            setAuthorization({
                hasRole: allowRoles.includes(session.user.role),
                hasGroups: hasGroups(session.user)
            })
        }
    }, [session]);


    if(!authorization.hasRole){
        return <Unauthorized />
    }

    if(authorization.hasRole && session.user.role === Role.PROFESSOR && !authorization.hasGroups){
        return <UnauthorizedMissingGroups
            onCreateGroup={async () => {
                /*
                    Strange bug patch:
                    Normally we would use "update" function of the useSession hook available in Next Auth 4
                    https://next-auth.js.org/getting-started/client#updating-the-session
                    It is not working because "update" is undefined for some reason
                    So we dispatch the event manually:
                 */
                await mutate();
                const event = new Event("visibilitychange");
                document.dispatchEvent(event);
            }}
        />
    }

    return children;
}

const hasGroups = (user) => user.groups?.length > 0;

const UnauthorizedMissingGroups = ( { onCreateGroup } ) => {
    const [ addGroupDialogOpen, setAddGroupDialogOpen ] = useState(false);
    return (
        <Unauthorized>
            <Typography variant="h6">You are not a member of any groups.</Typography>
            <Button variant={"contained"} onClick={() => setAddGroupDialogOpen(true)}>Create a new group</Button>
            <Button onClick={() => signOut()} variant="text" color="primary">Sign Out</Button>
            <AddGroupDialog
                open={addGroupDialogOpen}
                onClose={() => setAddGroupDialogOpen(false)}
                onSuccess={async () => {
                    setAddGroupDialogOpen(false);
                    /*
                    This will refetch the session data and update the component that is using the useSession hook with the new data.
                    * */
                    onCreateGroup && await onCreateGroup();
                }}
            />
        </Unauthorized>
    )
}
export default Authorisation;
