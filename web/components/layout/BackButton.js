import { Button, Stack } from "@mui/material"
import Link from "next/link"

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const BackButton = ({ backUrl }) => {
    return (
        <Stack direction="row" alignItems="center">
            <Link href={backUrl}>
                <Button startIcon={<ArrowBackIosIcon />}>Back</Button>
            </Link>
        </Stack>
    )

}

export default BackButton