import { Typography } from "@mui/material"
import { Stack } from "@mui/system"

const EvaluationTitleBar = ({ title, action }) => {

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" py={1} height={50}>
            <Stack flex={1}>
            <Typography variant="h5">{title}</Typography>
            </Stack>
            {action}
        </Stack>
    )
}

export default EvaluationTitleBar