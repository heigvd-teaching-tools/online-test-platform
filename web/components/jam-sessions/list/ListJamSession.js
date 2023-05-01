import Link from 'next/link';
import DataGrid from "../../ui/DataGrid";
import {Button, IconButton, Stack } from "@mui/material";
import DisplayPhase from "../DisplayPhase";
import {JamSessionPhase } from "@prisma/client";
import Image from "next/image";
import { displayDateTime, linkPerPhase } from "./utils";
const ListJamSession = ({ jamSessions, onStart, onDelete }) =>
    <DataGrid
        header={gridHeader}
        items={jamSessions?.map((jamSession) => ({
            label: jamSession.label,
            createdAt: displayDateTime(jamSession.createdAt),
            updatedAt: displayDateTime(jamSession.updatedAt),
            questions: jamSession.jamSessionToQuestions.length,
            students: jamSession.students.length,
            phase:
                <Stack direction="row" spacing={1} sx={{ width:'100%' }}>
                    <DisplayPhase phase={jamSession.phase} />
                    {jamSession.phase === JamSessionPhase.DRAFT && (
                        <Button
                            key="promote-to-in-progress"
                            color="info"
                            onClick={(ev) => onStart(ev, jamSession)}
                            startIcon={<Image alt="Promote" src="/svg/icons/finish.svg" layout="fixed" width="18" height="18" />}
                        >
                            Start
                        </Button>
                    )}
                </Stack>,
            meta: {
                key: jamSession.id,
                linkHref: linkPerPhase(jamSession.phase, jamSession.id),
                actions:  [(
                    <>
                        <Link href={`/jam-sessions/${jamSession.id}/analytics`} passHref>
                        <IconButton key="analytics">
                            <Image alt="Analytics" src="/svg/icons/analytics.svg" layout="fixed" width="18" height="18" />
                        </IconButton>
                        </Link>
                        <IconButton key="delete-jam-session" onClick={(ev) => onDelete(ev, jamSession)}>
                            <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                        </IconButton>
                    </>
                )]
            }
        }))
        }
    />

const gridHeader = {
    actions: {
        label: 'Actions',
        width: '80px',
    },
    columns: [
        {
            label: 'Label',
            column: { flexGrow: 1, }
        },{
            label: 'Created At',
            column: { width: '160px', }
        },{
            label: 'Updated At',
            column: { width: '160px', }
        },{
            label: 'Questions',
            column: { width: '80px', }
        },{
            label: 'Students',
            column: { width: '80px', }
        },{
            label: 'Phase',
            column: { width: '200px', }
        }
    ]
};

export default ListJamSession;
