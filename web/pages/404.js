import { Typography } from "@mui/material";
import Unauthorized from "../components/security/Unauthorized";

const Page404 = () => {
    return(
        <Unauthorized>
            <Typography variant="h6">You are not authorized to view this page.</Typography>
        </Unauthorized>
    )
}

export default Page404;