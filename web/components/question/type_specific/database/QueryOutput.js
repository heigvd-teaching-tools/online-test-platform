import {
    Alert,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography, useTheme
} from "@mui/material";
import Image from "next/image";
import DateTimeAgo from "../../../feedback/DateTimeAgo";
import {useCallback} from "react";
const OutputStatusDisplay = ({ status }) => {
    const renderStatus = (status) => {
        switch (status) {
            case "SUCCESS":
                return <Image src="/svg/database/success.svg" width={16} height={16} />
            case "ERROR":
                return <Image src="/svg/database/error.svg" width={16} height={16} />
            case "WARNING":
                return <Image src="/svg/database/warning.svg" width={16} height={16} />
            case "RUNNING":
                return <Image src="/svg/database/running.svg" width={16} height={16} />
            default:
                return null
        }
    }
    return renderStatus(status)
}

const QueryOutput = ({ queryOutput }) => {

    const renderQueryOutput = (output) => {
        switch (output?.type) {
            case "TABULAR":
            case "SCALAR":
                return <QueryOutputTabular dataset={output.result} />

                // return <QueryOutputScalar dataset={output.result} />
            case "TEXT":
                return <QueryOutputText feedback={output.feedback} />
            default:
                return null
        }
    }

    const severity = (status) => {
        switch (status) {
            case "SUCCESS":
                return "success"
            case "ERROR":
                return "error"
            case "WARNING":
                return "warning"
            case "RUNNING":
                return "info"
            default:
                return "info"
        }
    }

    const getStatus = useCallback( () => {
        if(queryOutput?.output?.status) {
            return queryOutput.output.status
        }
        return "RUNNING"
    },  [queryOutput])

    return (
        queryOutput && (
            <Alert severity={severity(getStatus())}>
                <Stack spacing={1}>
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        <Typography variant={"caption"}>Last run:</Typography>
                        {
                            queryOutput.updatedAt && (
                                <DateTimeAgo date={new Date(queryOutput.updatedAt)} />
                            )
                        }
                    </Stack>
                    <Stack direction={"row"} spacing={1}>
                        {getStatus() === "RUNNING" && (
                                <Image src="/svg/database/running.svg" width={16} height={16} />
                        )}
                        {queryOutput?.output?.result && renderQueryOutput(queryOutput?.output)}
                    </Stack>
                </Stack>
            </Alert>
        )
    );
}
const QueryOutputTabular = ({ dataset }) => {
    const theme = useTheme();

    return (
        <TableContainer sx={{
            height: 'max-content',
            maxHeight: "300px",
            maxWidth: "100%"
        }}>
            <Table
                size="small"
                sx={{
                    width: 'max-content',
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`
                }}
            >
                <TableHead>
                    <TableRow>
                        {dataset.columns.map((col, index) => (
                            <TableCell
                                key={index}
                                variant="head"
                                sx={{
                                    minWidth: 'min-content',
                                    maxWidth: '350px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                {col.name}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataset.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((value, colIndex) => (
                                <TableCell
                                    key={colIndex}
                                    sx={{
                                        minWidth: 'min-content',
                                        maxWidth: '350px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        borderRight: `1px solid ${theme.palette.divider}`,
                                        borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    {value}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}


const QueryOutputScalar = ({ dataset }) => {
    return (
        <Typography variant="body1">{dataset.rows[0]}</Typography>
    )
}

const QueryOutputText = ({ feedback }) => {
    return (
        <Typography variant="body1">{feedback}</Typography>
    )
}

export default QueryOutput;
