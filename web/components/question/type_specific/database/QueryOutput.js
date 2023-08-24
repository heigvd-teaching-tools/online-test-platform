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

const QueryOutput = ({ output }) => {

    console.log("QueryOutput", output)
    const renderQueryOutput = (output) => {
        switch (output.type) {
            case "TABULAR":
                return <QueryOutputTabular result={output.result} />
            case "SCALAR":
                return <QueryOutputScalar result={output.result} />
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

    return (
        output && (
            <Alert severity={severity(output.status)}>
                <Stack direction={"row"} spacing={1}>
                    {output.status && output.status === "RUNNING" && (
                            <Image src="/svg/database/running.svg" width={16} height={16} />
                    )}
                    {renderQueryOutput(output)}
                </Stack>
            </Alert>
        )
    );
}

const QueryOutputTabular = ({ result }) => {
    const theme = useTheme()

    console.log("QueryOutputTabular", theme)

    const columns = result?.fields.map((field) => field.name) || []

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
                        {columns.map((col, index) => (
                            <TableCell
                                key={index}
                                variant="head"
                                sx={{
                                    minWidth: 'min-content',
                                    maxWidth: '200px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                {col}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>

                    {result.rows.map((row, rowIndex, array) => (
                        <TableRow key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <TableCell
                                    key={colIndex}
                                    sx={{
                                        minWidth: 'min-content',
                                        maxWidth: '200px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        borderRight: `1px solid ${theme.palette.divider}`,
                                        borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    {row[col]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </TableContainer>
    )
}


const QueryOutputScalar = ({ result }) => {
    return (
        <Typography variant="body1">Output: {result.rows[0][result.fields[0].name]}</Typography>
    )
}

const QueryOutputText = ({ feedback }) => {
    return (
        <Typography variant="body1">{feedback}</Typography>
    )
}

export default QueryOutput;
