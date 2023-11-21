import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { EvaluationPhase } from '@prisma/client'
import { EvaluationStatus } from '@prisma/client'
import { Button, IconButton, Stack, Tooltip } from '@mui/material'

import { getStudentEntryLink } from '@/code/utils'
import DisplayPhase from '../DisplayPhase'
import DataGrid from '@/components/ui/DataGrid'

const ListEvaluation = ({ groupScope, evaluations, onStart, onDelete }) => (
  <DataGrid
    header={{
      actions: {
        label: 'Actions',
        width: '110px',
      },
      columns: [
        {
          label: 'Label',
          column: { flexGrow: 1 },
          renderCell: (row) => row.label,
        },
        {
          label: 'Created At',
          column: { width: '160px' },
          renderCell: (row) => new Date(row.createdAt).toLocaleString(),
        },
        {
          label: 'Updated At',
          column: { width: '160px' },
          renderCell: (row) => new Date(row.updatedAt).toLocaleString(),
        },
        {
          label: 'Questions',
          column: { width: '80px' },
          renderCell: (row) => row.evaluationToQuestions.length,
        },
        {
          label: 'Students',
          column: { width: '80px' },
          renderCell: (row) => row.students.length,
        },
        {
          label: 'Phase',
          column: { width: '100px' },
          renderCell: (row) => (
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <DisplayPhase phase={row.phase} />
              {row.phase === EvaluationPhase.DRAFT && (
                <Button
                  key="promote-to-in-progress"
                  color="info"
                  onClick={(ev) => onStart(ev, row)}
                  startIcon={
                    <Image
                      alt="Promote"
                      src="/svg/icons/finish.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                  }
                >
                  Start
                </Button>
              )}
            </Stack>
          ),
        },
      ],
    }}
    items={evaluations?.map((evaluation) => ({
      ...evaluation,
      meta: {
        key: `evaluation-${evaluation.id}`,
        linkHref: `/${groupScope}/evaluations/${evaluation.id}`,
        actions: [
          <React.Fragment key="actions">
          <Tooltip title="Copy student link to clipboard" key="add-link-to-clipboard">
            <IconButton
              onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                ;(async () => {
                  await navigator.clipboard.writeText(
                    getStudentEntryLink(evaluation.id)
                  )
                })()
              }}
            >
              <Image
                alt="Copy link"
                src="/svg/icons/link.svg"
                layout="fixed"
                width="18"
                height="18"
              />
            </IconButton>
            </Tooltip>
            <Link href={`/${groupScope}/evaluations/${evaluation.id}/analytics`} passHref key="analytics">
              <Tooltip title="Open Analytics Page">
                <IconButton component="span">
                  <Image
                    alt="Analytics"
                    src="/svg/icons/analytics.svg"
                    layout="fixed"
                    width="18"
                    height="18"
                  />
                </IconButton>
              </Tooltip>
            </Link>
            { evaluation.status === EvaluationStatus.ACTIVE && (
                <Tooltip title="Add to archive" key="archive">
                  <IconButton

                    onClick={(ev) => onDelete(ev, evaluation)}
                  >
                    <Image
                      alt="Add to archive"
                      src="/svg/icons/archive.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                </IconButton>
                </Tooltip>
            )}

            { evaluation.status === EvaluationStatus.ARCHIVED && (
                <Tooltip title="Delete definitively" key="archive">
                  <IconButton
                    onClick={(ev) => onDelete(ev, evaluation)}
                  >
                    <Image
                      alt="Delete definitively"
                      src="/svg/icons/delete.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                </IconButton>
                </Tooltip>
            )}


          </React.Fragment>,
        ],
      },
    }))}
  />
)

export default ListEvaluation
