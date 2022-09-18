import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ExamSessionPhase } from '@prisma/client';
import { Box, Toolbar, Button, IconButton, Typography, Stack } from '@mui/material';
import LayoutMain from '../../components/layout/LayoutMain';
import DataGrid from '../../components/ui/DataGrid';
import { useSnackbar } from '../../context/SnackbarContext';
import DialogFeedback from '../../components/feedback/DialogFeedback';
import DisplayPhase from '../../components/exam-session/DisplayPhase';
import LoadingAnimation from '../../components/feedback/LoadingAnimation';

const displayDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

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

const ExamSessions = () => {
  const router = useRouter();
  const { show: showSnackbar } = useSnackbar();

  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ clickedExamSession, setCLickedExamSession ] = useState(null);

  const { data, error } = useSWR(
    `/api/exam-sessions`, 
    (...args) => fetch(...args).then((res) => res.json())
  );
  
  const [ examSessions, setExamSession ] = useState(data);

  const [ endOfDraftDialogOpen, setEndOfDraftDialogOpen ] = useState(false);

  useEffect(() => {
    if(data){
      setExamSession(data);
    }
  }, [data]);

  const deleteExamSession = async () => {
    await fetch(`/api/exam-sessions/${clickedExamSession.id}`, {
      method: 'DELETE',
    })
    .then((_) => {
      setExamSession(examSessions.filter((exam) => exam.id !== clickedExamSession.id));
      showSnackbar('Exam session deleted', 'success');
    })
    .catch((_) => {
      showSnackbar('Error deleting exam session', 'error');
    });
    setCLickedExamSession(null);
  }

  const linkPerPhase = (phase, examSessionId) => {
    switch(phase){
      case ExamSessionPhase.DRAFT:
        return `/exam-sessions/${examSessionId}/draft/1`;
      case ExamSessionPhase.IN_PROGRESS:
        return `/exam-sessions/${examSessionId}/in-progress/1`;
      case ExamSessionPhase.GRADING:
        return `/exam-sessions/${examSessionId}/grading/1`;
      case ExamSessionPhase.FINISHED:
        return `/exam-sessions/${examSessionId}/finished`;
      default:
        return `/exam-sessions`;
    }
  }

  const endDraftPhase = async () => {
    setEndOfDraftDialogOpen(false);
    await fetch(`/api/exam-sessions/${clickedExamSession.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ phase: ExamSessionPhase.IN_PROGRESS })
    });
    router.push(`/exam-sessions/${clickedExamSession.id}/in-progress/1`);
  }

  if (error) return <div>failed to load</div>
  if (!examSessions) return <LoadingAnimation /> 

  return (
    <LayoutMain>
    <Box sx={{ minWidth:'100%' }}>
      <Toolbar disableGutters variant="dense">
        <Link href="/exam-sessions/new">
          <Button>New exam session</Button>
        </Link>
      </Toolbar>
      {examSessions && examSessions.length > 0 && (
        <DataGrid 
          header={gridHeader} 
          items={examSessions.map(examSession => ({
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
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setCLickedExamSession(examSession);
                          setEndOfDraftDialogOpen(true);
                        }}
                        startIcon={<Image alt="Promote" src="/svg/exam/promote-in-progress.svg" layout="fixed" width="18" height="18" />}
                      >
                        Start
                    </Button>
                  )}
                </Stack>,
            meta: {
              key: examSession.id,
              linkHref: linkPerPhase(examSession.phase, examSession.id),
              actions:  [(
                  <IconButton key="delete-exam" onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setCLickedExamSession(examSession);
                    setDeleteDialogOpen(true);
                  }}>
                    <Image alt="Delete" src="/svg/exam/exam-delete.svg" layout="fixed" width="18" height="18" />
                  </IconButton>
              )]
            }
          }))
          } 
          />
      )}
      <DialogFeedback 
          open={deleteDialogOpen}  
          title="Delete exam session"
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
              {clickedExamSession && ( clickedExamSession.durationHours > 0 || clickedExamSession.durationMins > 0 ) && (
                  <Typography variant="body1" gutterBottom>End time estimated at <b>{
                    new Date(Date.now() + (clickedExamSession.durationHours * 3600000) + (clickedExamSession.durationMins * 60000)).toLocaleTimeString()
                  }</b>.</Typography>
              )}
              <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
              </>
          }
          onClose={() => setEndOfDraftDialogOpen(false)}
          onConfirm={endDraftPhase}
      />
    </Box>
    </LayoutMain>
  )
}

export default ExamSessions;