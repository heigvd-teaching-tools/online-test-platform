import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';

import LayoutMain from '../../components/layout/LayoutMain';
import { Box, Toolbar, Button, IconButton } from '@mui/material';
import { useSnackbar } from '../../context/SnackbarContext';
import DataGrid from '../../components/ui/DataGrid';
import DialogFeedback from '../../components/feedback/DialogFeedback';

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
  const { show: showSnackbar } = useSnackbar();

  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ examToDelete, setExamToDelete ] = useState(null);

  const { data, error } = useSWR(
    `/api/exams`, 
    (...args) => fetch(...args).then((res) => res.json())
  );

  const [ exams, setExams ] = useState(data);

  useEffect(() => {
    setExams(data);
  }, [data]);

  const deleteExam = async () => {
    await fetch(`/api/exams/${examToDelete}`, {
      method: 'DELETE',
    })
    .then((_) => {
      setExams(exams.filter((exam) => exam.id !== examToDelete));
      showSnackbar('Exam deleted', 'success');
    })
    .catch((_) => {
      showSnackbar('Error deleting exam', 'error');
    });
    setExamToDelete(null);
  }

  return (
    <LayoutMain>
    <Box sx={{ minWidth:'100%' }}>
      <Toolbar disableGutters variant="dense">
        <Link href="/exams/new">
          <Button>Create a new exam</Button>
        </Link>
      </Toolbar>
      {exams && exams.length > 0 && (
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
                <IconButton key="delete-exam" onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  setExamToDelete(exam.id);
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
            title="Delete exam"
            content="Are you sure you want to delete this exam?"
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={deleteExam}
        />
    </Box>
    </LayoutMain>
  )
}

export default Exams;