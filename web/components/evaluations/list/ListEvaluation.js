import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { EvaluationPhase, EvaluationStatus } from '@prisma/client'
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material'

import { getStudentEntryLink } from '@/code/utils'
import DisplayPhase from '../DisplayPhase'
import GridGrouping from '@/components/ui/GridGrouping'
import { weeksAgo } from '@/components/questions/list/utils'
import DateTimeAgo from '@/components/feedback/DateTimeAgo'

const ListEvaluation = ({ groupScope, evaluations, onStart, onDelete }) => (
  <Stack spacing={1} height={"100%"}>
   <Link href={`/${groupScope}/evaluations/new`}>
    <Button>Create a new evaluation</Button>
  </Link>
  <GridGrouping
    label={"Evaluations"}
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
          label: 'Updated',
          column: { width: '120px' },
          renderCell: (row) => <DateTimeAgo date={new Date(row.updatedAt)} />,
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
          column: { width: '130px' },
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
    groupings={[
      {
        groupBy: 'phase',
        option: 'Phase',
        type: 'element',
        renderLabel: (row) => <Box><DisplayPhase phase={row.label} /></Box>,
      },
      {
        groupBy: 'updatedAt',
        option: 'Last Update',
        type: 'date',
        renderLabel: (row) => weeksAgo(row.label),
        
      },
    ]}
  />
  </Stack>
)

export default ListEvaluation
