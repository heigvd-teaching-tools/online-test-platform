import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';

import LayoutMain from '../../layout/LayoutMain';
import {Box, Button, IconButton, Stack} from '@mui/material';
import { useSnackbar } from '../../../context/SnackbarContext';
import DataGrid from '../../ui/DataGrid';
import DialogFeedback from '../../feedback/DialogFeedback';

import { Role } from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import AddCollectionDialog from "../AddCollectionDialog";
import MainMenu from "../../layout/MainMenu";
import ReactTimeAgo from "react-time-ago";

import TimeAgo from 'javascript-time-ago';

import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addLocale(en);

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
        column: { width: '120px', }
    },{
        label: 'Points',
        column: { width: '120px', }
      }
  ]
};

const PageList = () => {
  const { show: showSnackbar } = useSnackbar();

  const [ addDialogOpen, setAddDialogOpen ] = useState(false);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ collectionToDelete, setCollectionToDelete ] = useState(null);

  const { data, error } = useSWR(
    `/api/collections`,
    (...args) => fetch(...args).then((res) => res.json())
  );

  const [ collections, setCollections ] = useState(data);

  useEffect(() => {
    setCollections(data);
  }, [data]);

  const deleteCollection = async () => {
    await fetch(`/api/collections/${collectionToDelete}`, {
      method: 'DELETE',
    })
    .then((_) => {
      setCollections(collections.filter((collection) => collection.id !== collectionToDelete));
      showSnackbar('Collection deleted', 'success');
    })
    .catch((_) => {
      showSnackbar('Error deleting collections', 'error');
    });
    setCollectionToDelete(null);
    setDeleteDialogOpen(false);
  }

  return (
      <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <LayoutMain
            header={ <MainMenu /> }
            subheader={
                <Stack alignItems="flex-end" sx={{ p : 1}}>
                  <Button onClick={() => setAddDialogOpen(true)}>Create a new collection</Button>
                </Stack>
            }
        >
        <Box sx={{ minWidth:'100%', pl:2, pr:2 }}>
          {collections && collections.length > 0 && (
            <DataGrid
              header={gridHeader}
              items={collections.map(collection => ({
                label: collection.label,
                createdAt: <ReactTimeAgo date={new Date(collection.createdAt)} locale="en-US" timeStyle="round-minute" />,
                updatedAt: <ReactTimeAgo date={new Date(collection.updatedAt)} locale="en-US" timeStyle="round-minute" />,
                questions: collection.questions?.length || "0",
                points: collection.questions?.reduce((acc, question) => acc + question.points, 0) || "0",
                meta: {
                  key: collection.id,
                  linkHref: `/collections/${collection.id}`,
                  actions:  [(
                    <IconButton key="delete-collection" onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      setCollectionToDelete(collection.id);
                      setDeleteDialogOpen(true);
                    }}>
                      <Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />
                    </IconButton>
                  )]
                }
              }))
              }
              />
          )}
          <DialogFeedback
                open={deleteDialogOpen}
                title="Delete collection"
                content="Are you sure you want to delete this collection?"
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={deleteCollection}
            />
            <AddCollectionDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                handleAddCollection={(collection) => {
                    setCollections([collection, ...collections]);
                    setAddDialogOpen(false);
                }}
            />
        </Box>
        </LayoutMain>
      </Authorisation>
  )
}

export default PageList;
