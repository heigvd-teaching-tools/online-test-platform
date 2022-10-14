import { useSession } from "next-auth/react";
import Unauthorized from "./Unauthorized";

const Authorisation = ({ children, allowRoles = [] }) => {
    const { data: { user } } = useSession();
    const isAuthorised = allowRoles.includes(user.role);
    return isAuthorised ? children : <Unauthorized />;
}

export default Authorisation;