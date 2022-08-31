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
  
  actions: {
    label: 'Actions',
    width: '80px',
  },
  columns: [
    {
        label: 'Label',
        column: { flexGrow: 1, }
    },{
        label: 'Description',
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
    }
  ]
};

const Exams = () => {

  const { data: exams, error } = useSWR(
    `/api/exams`, 
    (...args) => fetch(...args).then((res) => res.json())
  );

  return (
    <Box sx={{ minWidth:'100%' }}>
      <Toolbar disableGutters variant="dense">
        <Link href="/exams/new">
          <Button>Create a new exam</Button>
        </Link>
      </Toolbar>
      {exams && (
        <DataGrid 
          header={gridHeader} 
          items={exams.map(exam => ({
            label: exam.label,
            description: exam.description,
            createdAt: displayDateTime(exam.createdAt),
            updatedAt: displayDateTime(exam.updatedAt),
            questions: exam.questions.length,
            meta: {
              key: exam.id,
              linkHref: `/exams/${exam.id}`,
              actions:  [(
                <IconButton key="1">
                  <Image alt="Delete" src="/exam-delete.svg" layout="fixed" width="18" height="18" />
                </IconButton>
              )]
            }
          }))
          } 
          />
      )}
    </Box>
  )
}

export default Exams;