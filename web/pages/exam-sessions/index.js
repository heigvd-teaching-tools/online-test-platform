import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Toolbar, Button, IconButton } from '@mui/material';

import DataGrid from '../../components/ui/DataGrid';

const displayDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
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
        label: 'Participants',
        column: { width: '80px', }
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
            participants: examSession.participants.length,
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