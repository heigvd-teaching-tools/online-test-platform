import { Role } from "@prisma/client";
import {signOut, useSession } from "next-auth/react";
import Unauthorized from "./Unauthorized";
import {Button, Typography} from "@mui/material";
const Authorisation = ({ children, allowRoles = [] }) => {
    const { data: { user } } = useSession();
    const roleCheck = allowRoles.includes(user.role);
    if(!roleCheck){
        return <Unauthorized />
    }
    if(user.role === Role.PROFESSOR){
        return hasGroups(user) ? children : <UnauthorizedMissingGroups />
    }
    return children;
}

const hasGroups = (user) => user.groups?.length > 0;

const UnauthorizedMissingGroups = () => {
    return (
        <Unauthorized>
            <Typography variant="h6">You are not a member of any groups.</Typography>
            <Button onClick={() => signOut()} variant="text" color="primary">Sign Out</Button>
        </Unauthorized>
    )
}
export default Authorisation;
