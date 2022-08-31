import Link from 'next/link';
import { useRouter } from 'next/router';
import { Tabs, Tab } from '@mui/material';

const MainMenu = () => {
    const { asPath } = useRouter();
    return (
        <Tabs value={asPath.split("/")[1] || "exams"} aria-label="main-menu" textColor="inherit" indicatorColor="secondary">{
                mainPaths.map(path => (
                    <Link key={path.path} value={path.path} href={`/${path.path}`} passHref>
                        <Tab value={path.path} label={path.label} sx={{ opacity:1 }} />
                    </Link>
                ))
            }
        </Tabs>
    )
}

const mainPaths = [{
    path: "exams",
    label: "Exams"
},{
    path: "exam-sessions",
    label: "Exam Sessions"
}];
    
export default MainMenu;