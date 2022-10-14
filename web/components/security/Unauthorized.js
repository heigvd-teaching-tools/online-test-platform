import {Box, Stack} from "@mui/material";
import Image from "next/image";

const Unauthorized = () => {
    return (
        <Stack alignItems="center" justifyContent="center" sx={{height: '100vh'}}>
            <Box sx={{ width: '20%', height: '20%', position: 'relative'}}>
                <Image src="/svg/401.svg" alt="Unauthorized" layout="fill" />
            </Box>
        </Stack>
    )
}
export default Unauthorized;