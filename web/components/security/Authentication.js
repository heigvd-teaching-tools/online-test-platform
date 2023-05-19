import { useSession } from "next-auth/react";
import LoadingAnimation from "../feedback/Loading";
import LoginGitHub from "./LoginGitHub";

const Authentication = ({ children }) => {
    const { status } = useSession();
    return(
        <>
        { status === 'loading' && <LoadingAnimation /> }
        { status === 'unauthenticated' && <LoginGitHub /> }
        { status === 'authenticated' && children }
        </>
    )
}
export default Authentication;
