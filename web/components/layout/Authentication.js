import { useSession } from "next-auth/react";
import LoadingAnimation from "../feedback/LoadingAnimation";
import LoginGitHub from "./LoginGitHub";

const Authentication = ({ children }) => {
    const { data, status } = useSession();
    return(
        <>
        { status === 'loading' && <LoadingAnimation /> }
        { status === 'unauthenticated' && <LoginGitHub /> }
        { status === 'authenticated' && children }
        </>
    )
}

export default Authentication;