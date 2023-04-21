import Link from 'next/link';
import { useRouter } from 'next/router';
import {Tabs, Tab, Box, Stack} from '@mui/material';
import GroupSelector from "./GroupSelector";
const MainMenu = () => {
    const { asPath } = useRouter();
    return (
        <Stack direction={"row"}>
            <Box>
                <GroupSelector />
            </Box>
            <Tabs value={asPath.split("/")[1] || "questions"} aria-label="main-menu" textColor="inherit" indicatorColor="secondary">{
                    mainPaths.map(path => (
                        <Link key={path.path} value={path.path} href={`/${path.path}`} passHref>
                            <Tab value={path.path} label={path.label} sx={{ opacity:1 }} />
                        </Link>
                    ))
                }
            </Tabs>
        </Stack>
    )
}

const mainPaths = [{
    path: "questions",
    label: "Questions"
},{
    path: "collections",
    label: "Collections"
},{
    path: "sessions",
    label: "Sessions"
}];

export default MainMenu;
