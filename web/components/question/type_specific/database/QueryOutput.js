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
import {useCallback, useEffect, useRef} from "react";
import {useDebouncedCallback} from "use-debounce";


const QueryOutput = ({ showAgo, header, color, queryOutput, onHeightChange }) => {

    const containerRef = useRef(null);

    const debouncedHeightChange = useDebouncedCallback((h) => onHeightChange(h), 100)

    useEffect(() => {
        if (onHeightChange && containerRef.current) {
            const observer = new ResizeObserver(() => {
                debouncedHeightChange(containerRef.current?.getBoundingClientRect().height);
            });
            observer.observe(containerRef.current);

            // Cleanup observer on component unmount
            return () => observer.disconnect();
        }
    }, [debouncedHeightChange]);

    const renderQueryOutput = (output) => {
        switch (output?.type) {
            case "SCALAR":
            // return <QueryOutputScalar dataset={output.result} />
            case "TABULAR":
                return <QueryOutputTabular dataset={output.result} />
            case "TEXT":
                return <QueryOutputText feedback={output.feedback} />
            default:
                return null
        }
    }

    const severity = (status) => {
        switch (status) {
            case "SUCCESS":
                return color || "success"
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
            <Alert icon={false} severity={severity(getStatus())} ref={containerRef}>
                <Stack spacing={1}>
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        {header}
                        {showAgo && (
                            <>
                                <Typography variant={"caption"}>Last run:</Typography>
                                {
                                    queryOutput.updatedAt && (
                                        <DateTimeAgo date={new Date(queryOutput.updatedAt)} />
                                    )
                                }
                            </>
                        )}
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
        <Stack spacing={1}>
        <TableContainer sx={{
            height: 'max-content',
            maxHeight: "350px",
            maxWidth: "100%"
        }}>
            <Table
                size="small"
                sx={{
                    width: 'max-content',
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
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
        <Typography variant="caption">Row Count: {dataset.rows.length}</Typography>
    </Stack>
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
