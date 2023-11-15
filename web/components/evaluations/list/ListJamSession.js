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
    header={gridHeader}
    items={evaluations?.map((evaluation) => ({
      label: evaluation.label,
      createdAt: new Date(evaluation.createdAt).toLocaleString(),
      updatedAt: new Date(evaluation.updatedAt).toLocaleString(),
      questions: evaluation.evaluationToQuestions.length,
      students: evaluation.students.length,
      phase: (
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <DisplayPhase phase={evaluation.phase} />
          {evaluation.phase === EvaluationPhase.DRAFT && (
            <Button
              key="promote-to-in-progress"
              color="info"
              onClick={(ev) => onStart(ev, evaluation)}
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
      meta: {
        key: `evaluation-${evaluation.id}`,
        linkHref: `/${groupScope}/evaluation/${evaluation.id}`,
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
            <Link href={`/${groupScope}/evaluation/${evaluation.id}/analytics`} passHref key="analytics">
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

const gridHeader = {
  actions: {
    label: 'Actions',
    width: '110px',
  },
  columns: [
    {
      label: 'Label',
      column: { flexGrow: 1 },
    },
    {
      label: 'Created At',
      column: { width: '160px' },
    },
    {
      label: 'Updated At',
      column: { width: '160px' },
    },
    {
      label: 'Questions',
      column: { width: '80px' },
    },
    {
      label: 'Students',
      column: { width: '80px' },
    },
    {
      label: 'Phase',
      column: { width: '200px' },
    },
  ],
}

export default ListEvaluation
