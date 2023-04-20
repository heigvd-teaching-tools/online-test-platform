import { signOut, useSession } from "next-auth/react";
import LoadingAnimation from "../feedback/LoadingAnimation";
import LoginGitHub from "./LoginGitHub";
import Unauthorized from "./Unauthorized";
import {Button, Typography} from "@mui/material";
const Authentication = ({ children }) => {
    const { data:session, status } = useSession();
    return(
        <>
        { status === 'loading' && <LoadingAnimation /> }
        { status === 'unauthenticated' && <LoginGitHub /> }
        { status === 'authenticated' && (
            session.user.groups?.length > 0 ? children : <Unauthorized>
                <Typography variant="h6">You are not a member of any groups.</Typography>
                <Button onClick={() => signOut()} variant="text" color="primary">Sign Out</Button>
            </Unauthorized>
        )}
        </>
    )
}
export default Authentication;
