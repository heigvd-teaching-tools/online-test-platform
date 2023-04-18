import LayoutMain from '../../layout/LayoutMain';
import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import {Box, Button, Checkbox, Stack, TextField, Typography} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Link from "next/link";

const PageCompose = () => {
    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <LayoutMain header={
                <Box>
                    <Link href="/collections">
                        <Button startIcon={<ArrowBackIosIcon /> } />
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

const QuestionSearch = () => {
    return (
        <Stack spacing={2} padding={2}>
            <Typography variant="body2" color="info"> Search by text </Typography>

            <TextField
                label={"Search by title"}
                variant="outlined"
                fullWidth
                focused
                color="info"
                size="small"
            />

            <TextField
                label={"Search by content"}
                variant="outlined"
                fullWidth
                color="info"
                size="small"
            />

            <Typography variant="body2" color="info"> Search by question type </Typography>
            <Box>
                <CheckboxLabel label="Multiple choice" checked={true} />
                <CheckboxLabel label="True or false" checked={true} />
                <CheckboxLabel label="Essay" checked={true} />
                <CheckboxLabel label="Code" checked={true} />
                <CheckboxLabel label="Web" checked={true} />
            </Box>

            <Typography variant="body2" color="info"> Search code question by language </Typography>
            <Box>
                <CheckboxLabel label="C++" checked={true} />
                <CheckboxLabel label="Java" checked={true} />
                <CheckboxLabel label="JavaScript" checked={true} />
                <CheckboxLabel label="Python" checked={true} />
            </Box>
        </Stack>
    )
};

const CheckboxLabel = ({label, checked}) => {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox size={"small"} checked={checked} color={"info"} />
            <Typography variant="body2" color="info"> {label} </Typography>
        </Stack>
    )
}

export default PageCompose;


