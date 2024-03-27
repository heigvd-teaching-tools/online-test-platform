import { Typography } from "@mui/material"


const DateTimeCell = ({ dateTime }) => {
    return (
        <>
        <Typography variant="caption">
            {new Date(dateTime).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
            {new Date(dateTime).toLocaleTimeString()}
        </Typography>
        </>
    )
}


export default DateTimeCell