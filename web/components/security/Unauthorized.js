import {Stack} from "@mui/material";
import Image from "next/image";

const Unauthorized = () => {
    return (
        <Stack alignItems="center" justifyContent="center" sx={{height: '100vh'}}>
            <Image src="/svg/401.svg" alt="Unauthorized" width={150} height={150} layout="fixed" />
        </Stack>
    )
}
export default Unauthorized;