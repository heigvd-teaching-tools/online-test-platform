
import {Box, Stack} from "@mui/material";
import Image from "next/image";
const Unauthorized = ({ children }) => {
    return (
        <Stack alignItems="center" justifyContent="center" height={"100vh"} width={"100vw"}>
            <Box sx={{ width: '20%', height: '20%', position: 'relative'}}>
                <Image src="/svg/401.svg" alt="Unauthorized" layout="fill" />
            </Box>
            <Stack spacing={1} padding={2} alignItems="center">
                {children}
            </Stack>
        </Stack>
    )
}
export default Unauthorized;
