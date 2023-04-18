import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

import {ExamSessionPhase, ExamSessionStatus, Role} from '@prisma/client';
import { Button, Typography, Stack, Tab} from '@mui/material';
import LayoutMain from '../../layout/LayoutMain';

import { useSnackbar } from '../../../context/SnackbarContext';
import LoadingAnimation from '../../feedback/LoadingAnimation';
import ListExamSession from "../list/ListExamSession";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import DialogFeedback from "../../feedback/DialogFeedback";
import {useRouter} from "next/router";
import Authorisation from "../../security/Authorisation";
import MainMenu from "../../layout/MainMenu";

const ExamSessions = () => {

    const router = useRouter();

    const { show: showSnackbar } = useSnackbar();
    const [ selected, setSelected ] = useState(null);

    const { data, error } = useSWR(
        `/api/exam-sessions`,
        (...args) => fetch(...args).then((res) => res.json())
    );

    const [ tab, setTab ] = useState(1);
    const [ examSessions, setExamSession ] = useState(data);

    const [ archiveDialogOpen, setArchiveDialogOpen ] = useState(false);
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ endOfDraftDialogOpen, setEndOfDraftDialogOpen ] = useState(false);

    useEffect(() => {
        if(data){
          setExamSession(data);
        }
    }, [data]);

    const endDraftPhase = async () => {
        setEndOfDraftDialogOpen(false);
        await fetch(`/api/exam-sessions/${selected.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ phase: ExamSessionPhase.IN_PROGRESS })
        });
        await router.push(`/exam-sessions/${selected.id}/in-progress`);
    }

    const archiveExamSession = async () => {
        await fetch(`/api/exam-sessions/${selected.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: ExamSessionStatus.ARCHIVED }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then((_) => {
            setExamSession(examSessions.map((exam) => {
                if(exam.id === selected.id){
                    exam.status = ExamSessionPhase.ARCHIVED;
                }
                return exam;
            }));
            showSnackbar('Exam session archived', 'success');
        })
        .catch((_) => {
            showSnackbar('Error archiving collections session', 'error');
        });
        setSelected(null);
    }

    const deleteExamSession = async () => {
        await fetch(`/api/exam-sessions/${selected.id}`, {
            method: 'DELETE',
        })
        .then((_) => {
            setExamSession(examSessions.filter((exam) => exam.id !== selected.id));
            showSnackbar('Exam session deleted', 'success');
        })
        .catch((_) => {
            showSnackbar('Error deleting collections session', 'error');
        });
        setSelected(null);
    }


  if (error) return <div>failed to load</div>
  if (!examSessions) return <LoadingAnimation />

  return (
      <Authorisation allowRoles={[ Role.PROFESSOR ]}>
      <TabContext value={tab}>
        <LayoutMain
            header={ <MainMenu /> }
            subheader={
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ pr: 2}}>
                    <TabList onChange={(e, v) => setTab(v)} aria-label="simple tabs example">
                        <Tab label="Active" value={1} />
                        <Tab label="Archived" value={2} />
                    </TabList>
                    { tab === 1 && (
                        <Link href="/exam-sessions/new">
                            <Button>Create a new exam session</Button>
                        </Link>
                    )}
                </Stack>
            }
            padding={2}
        >
          { examSessions && examSessions.length > 0 && (
            <ListExamSession
                examSessions={examSessions.filter((exam) => exam.status === (tab === 1 ? ExamSessionStatus.ACTIVE : ExamSessionStatus.ARCHIVED))}
                onStart={(ev, examSession) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setSelected(examSession);
                    setEndOfDraftDialogOpen(true);
                }}
                onDelete={(ev, examSession) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setSelected(examSession);
                    if(examSession.status === ExamSessionStatus.ARCHIVED){
                        setDeleteDialogOpen(true);
                    }else{
                        setArchiveDialogOpen(true);
                    }
                }}
            />
          )}
        </LayoutMain>
          <DialogFeedback
              open={archiveDialogOpen}
              title="Archive this exam session"
              content="Are you sure you want to archive this exam session?"
              onClose={() => setArchiveDialogOpen(false)}
              onConfirm={archiveExamSession}
          />
          <DialogFeedback
              open={deleteDialogOpen}
              title="Delete this exam session"
              content="Are you sure you want to delete this exam session?"
              onClose={() => setDeleteDialogOpen(false)}
              onConfirm={deleteExamSession}
          />
          <DialogFeedback
              open={endOfDraftDialogOpen}
              title="End of DRAFT phase"
              content={
                  <>
                      <Typography variant="body1" gutterBottom>This exam session is about to go to the <b>in-progress</b> phase.</Typography>
                      <Typography variant="body1" gutterBottom>Registered students will be able to start with their exam session.</Typography>
                      <Typography variant="body1" gutterBottom>Late student registrations will still be possible.</Typography>
                      {selected && ( selected.durationHours > 0 || selected.durationMins > 0 ) && (
                          <Typography variant="body1" gutterBottom>End time estimated at <b>{
                              new Date(Date.now() + (selected.durationHours * 3600000) + (selected.durationMins * 60000)).toLocaleTimeString()
                          }</b>.</Typography>
                      )}
                      <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
                  </>
              }
              onClose={() => setEndOfDraftDialogOpen(false)}
              onConfirm={endDraftPhase}
          />

      </TabContext>
      </Authorisation>
  )
}

export default ExamSessions;
