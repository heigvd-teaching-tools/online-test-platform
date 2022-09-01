import useSWR from 'swr';
import Link from 'next/link';
import { Box, Toolbar, Button, Chip } from '@mui/material';

import DataGrid from '../../components/ui/DataGrid';

const displayDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

const displayPhase = (phase) => {
  switch (phase) {
    case 'DRAFT':
      return <Chip label="Draft" color="warning" />;
    case 'REGISTRATION':
      return <Chip label="Registration" color="info" />;
    case 'IN_PROGRESS':
      return <Chip label="In progress" color="primary" />;
    case 'CORRECTION':
      return <Chip label="Correction" color="secondary" />;
    case 'FINISHED':
      return <Chip label="Finished" color="success" />;
    default:
      return 'N/A';
  }
}

const gridHeader = {
  
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
        column: { width: '70px', }
    }
  ]
};

const ExamSessions = () => {

  const { data: examSessions, error } = useSWR(
    `/api/exam-sessions`, 
    (...args) => fetch(...args).then((res) => res.json())
  );

  return (
    <Box sx={{ minWidth:'100%' }}>
      <Toolbar disableGutters variant="dense">
        <Link href="/exam-sessions/new">
          <Button>New exam session</Button>
        </Link>
      </Toolbar>
      {examSessions && (
        <DataGrid 
          header={gridHeader} 
          items={examSessions.map(examSession => ({
            label: examSession.label,
            createdAt: displayDateTime(examSession.createdAt),
            updatedAt: displayDateTime(examSession.updatedAt),
            questions: examSession.questions.length,
            students: examSession.students.length,
            phase: displayPhase(examSession.phase),
            meta: {
              key: examSession.id,
              linkHref: `/exam-sessions/${examSession.id}`
            }
          }))
          } 
          />

      )}
      
    </Box>
  )
}

export default ExamSessions;