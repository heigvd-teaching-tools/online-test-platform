import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import {Box, Button } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Link from "next/link";
import QuestionSearch from "../../question/QuestionSearch";

const PageCompose = () => {
    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <LayoutMain header={
                <Box>
                    <Link href="/collections">
                        <Button startIcon={<ArrowBackIosIcon /> }>
                            Back
                        </Button>
                    </Link>
                </Box>
            }>
                <LayoutSplitScreen
                    leftPanel={
                        <div>left</div>
                    }
                    rightPanel={
                        <QuestionSearch />
                    }
                />
            </LayoutMain>
        </Authorisation>
    );

};
export default PageCompose;


