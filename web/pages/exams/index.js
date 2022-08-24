import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Box, List, Typography, Toolbar, Button, IconButton, ListItem } from '@mui/material';
import Row from '../../components/layout/Row';
import Column from '../../components/layout/Column';

const displayDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

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
      <List>
        <ListItem divider>
          <Row key="header">
              <Column flexGrow="1">
                <Typography variant="button">Label</Typography>
              </Column>
              <Column flexGrow="1">
                <Typography variant="button">Description</Typography>
              </Column>
              <Column width="160px">
                <Typography variant="button">Created At</Typography>
              </Column>
              <Column width="160px">
                <Typography variant="button">Updated At</Typography>
              </Column>
              <Column width="80px">
                <Typography variant="button">Questions</Typography>
              </Column>
              <Column width="180px" right>
                <Typography variant="button">Actions</Typography>
              </Column>
          </Row>
          </ListItem>
        { exams && exams.map(exam => 
            <ListItem button divider key={exam.id}>
                <Row>
                  <Column flexGrow="1">
                    <Typography variant="body2">{exam.label}</Typography>
                  </Column>
                  <Column flexGrow="1">
                    <Typography variant="body2">{exam.description}</Typography>
                  </Column>
                  <Column width="160px">
                    <Typography variant="body2">{displayDateTime(exam.createdAt)}</Typography>
                  </Column>
                  <Column width="160px">
                    <Typography variant="body2">{displayDateTime(exam.updatedAt)}</Typography>
                  </Column>
                  <Column width="80px">
                    <Typography variant="body2">{exam.questions.length}</Typography>
                  </Column>
                  <Column width="180px" right>
                    <IconButton>
                      <Image alt="Edit" src="/exam-edit.svg" layout="fixed" width="18" height="18" />
                    </IconButton>
                    <IconButton onClick={(ev) => {
                      ev.stopPropagation();
                    }}>
                      <Image alt="Delete" src="/exam-delete.svg" layout="fixed" width="18" height="18" />
                    </IconButton>
                  </Column>
                </Row>
            </ListItem>
        )}
      </List>
    </Box>
  )
}

export default Exams;