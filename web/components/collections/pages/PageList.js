/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState, useEffect } from 'react'
import { Role } from '@prisma/client'
import useSWR from 'swr'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'

import { fetcher } from '@/code/utils'
import { useSnackbar } from '@/context/SnackbarContext'

import Authorization from '@/components/security/Authorization'
import LayoutMain from '@/components/layout/LayoutMain'
import MainMenu from '@/components/layout/MainMenu'
import DataGrid from '@/components/ui/DataGrid'

import DialogFeedback from '@/components/feedback/DialogFeedback'
import DateTimeAgo from '@/components/feedback/DateTimeAgo'
import AlertFeedback from '@/components/feedback/AlertFeedback'
import Loading from '@/components/feedback/Loading'

import AddCollectionDialog from '../list/AddCollectionDialog'
import GridGrouping from '@/components/ui/GridGrouping'
import { weeksAgo } from '@/components/questions/list/utils'

const PageList = () => {
  const router = useRouter()
  const { groupScope } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState(null)

  const { data, error } = useSWR(
    `/api/${groupScope}/collections`,
    groupScope ? fetcher : null,
  )

  const [collections, setCollections] = useState(data)

  useEffect(() => {
    setCollections(data)
  }, [data])

  const deleteCollection = async () => {
    await fetch(`/api/${groupScope}/collections/${collectionToDelete}`, {
      method: 'DELETE',
    })
      .then((_) => {
        setCollections(
          collections.filter(
            (collection) => collection.id !== collectionToDelete,
          ),
        )
        showSnackbar('Collection deleted', 'success')
      })
      .catch((_) => {
        showSnackbar('Error deleting collections', 'error')
      })
    setCollectionToDelete(null)
    setDeleteDialogOpen(false)
  }


  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading errors={[error]} loading={!data}>
        <LayoutMain header={<MainMenu />}>
          <Box
            sx={{
              minWidth: '100%',
              height: '100%',
              p: 2,
              bgcolor: 'background.paper',
            }}
          >
            {collections && (
              <GridGrouping
                label="Collections"
                actions={
                  <Button onClick={() => setAddDialogOpen(true)}>
                    Create a new collection
                  </Button>
                }
                header={{
                  actions: {
                    label: 'Actions',
                    width: '80px',
                  },
                  columns: [
                    {
                      label: 'Label',
                      column: { flexGrow: 1 },
                      renderCell: (row) => row.label,
                    },
                    {
                      label: 'Updated',
                      column: { width: '140px' },
                      renderCell: (row) => (
                        <DateTimeAgo date={new Date(row.updatedAt)} />
                      ),
                    },
                    {
                      label: 'Questions',
                      column: { width: '120px' },
                      renderCell: (row) =>
                        row.collectionToQuestions?.length || '0',
                    },
                    {
                      label: 'Points',
                      column: { width: '120px' },
                      renderCell: (row) =>
                        `${
                          row.collectionToQuestions?.reduce(
                            (acc, question) => acc + question.points,
                            0,
                          ) || 0
                        } pts` || '0',
                    },
                  ],
                }}
                items={collections.map((collection) => ({
                  ...collection,
                  meta: {
                    key: collection.id,
                    linkHref: `/${groupScope}/collections/${collection.id}`,
                    actions: [
                      <IconButton
                        key="delete-collection"
                        onClick={(ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          setCollectionToDelete(collection.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Image
                          alt="Delete"
                          src="/svg/icons/delete.svg"
                          width="18"
                          height="18"
                        />
                      </IconButton>,
                    ],
                  },
                }))}
                groupings={[
                  {
                    groupBy: 'updatedAt',
                    option: 'Last Update',
                    type: 'date',
                    renderLabel: (row) => weeksAgo(row.label),
                  },
                ]}
              />
            )}
          </Box>

          {collections && collections.length === 0 && (
            <AlertFeedback severity="info">
              <Typography variant="body1">
                No collections found for this group
              </Typography>
            </AlertFeedback>
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
              setCollections([collection, ...collections])
              setAddDialogOpen(false)
            }}
          />
        </LayoutMain>
      </Loading>
    </Authorization>
  )
}

export default PageList
