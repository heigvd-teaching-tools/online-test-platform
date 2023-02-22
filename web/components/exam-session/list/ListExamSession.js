import Link from 'next/link';
import DataGrid from "../../ui/DataGrid";
import {Button, IconButton, Stack } from "@mui/material";
import DisplayPhase from "../DisplayPhase";
import {ExamSessionPhase } from "@prisma/client";
import Image from "next/image";
import { displayDateTime, linkPerPhase } from "./utils";

const ListExamSession = ({ examSessions, onStart, onDelete }) =>
    <DataGrid
        header={gridHeader}
        items={examSessions.map((examSession) => ({
            label: examSession.label,
            createdAt: displayDateTime(examSession.createdAt),
            updatedAt: displayDateTime(examSession.updatedAt),
            questions: examSession.questions.length,
            students: examSession.students.length,
            phase:
                <Stack direction="row" spacing={1} sx={{ width:'100%' }}>
                    <DisplayPhase phase={examSession.phase} />
                    {examSession.phase === ExamSessionPhase.DRAFT && (
                        <Button
                            key="promote-to-in-progress"
                            color="info"
                            onClick={(ev) => onStart(ev, examSession)}
                            startIcon={<Image alt="Promote" src="/svg/icons/finish.svg" layout="fixed" width="18" height="18" />}
                        >
                            Start
                        </Button>
                    )}
                </Stack>,
            meta: {
                key: examSession.id,
                linkHref: linkPerPhase(examSession.phase, examSession.id),
                actions:  [(
                    <>
                        <Link href={`/exam-sessions/${examSession.id}/analytics`} passHref>
                        <IconButton key="analytics">
                            <Image alt="Analytics" src="/svg/icons/analytics.svg" layout="fixed" width="18" height="18" />
                        </IconButton>
                        </Link>
                        <IconButton key="delete-exam" onClick={(ev) => onDelete(ev, examSession)}>
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

export default ListExamSession;
