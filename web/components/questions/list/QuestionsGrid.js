import DateTimeAgo from "@/components/feedback/DateTimeAgo"
import QuestionTypeIcon from "@/components/question/QuestionTypeIcon"
import QuestionTagsViewer from "@/components/question/tags/QuestionTagsViewer"
import CodeQuestionTypeIcon from "@/components/question/type_specific/code/CodeQuestionTypeIcon"
import LanguageIcon from "@/components/question/type_specific/code/LanguageIcon"
import GridGrouping from "@/components/ui/GridGrouping"
import { Button, IconButton, Tooltip, Typography } from "@mui/material"
import { Stack } from "@mui/system"
import { QuestionType } from "@prisma/client"
import { useRouter } from "next/router"
import React from "react"
import { weeksAgo } from "./utils"
import { getTextByType } from "@/components/question/types"
import Image from 'next/image'

const QuestionsGrid = ({
    groupScope,
    questions,
    setAddDialogOpen,
    selection,
    setSelection,
    onRowClick,
    setOpenSideUpdate,
    setCopyDialogOpen,
    actions,
  }) => {
    const router = useRouter()
  
    return (
      <GridGrouping
        label="Questions"
        enableSelection
        selection={selection}
        onSelectionChange={(newSelection) => {
          console.log(newSelection)
          setSelection(newSelection)
        }}
        actions={actions}
        header={{
          actions: {
            label: 'Actions',
            width: '100px',
          },
          columns: [
            {
              label: 'Type',
              column: { width: '140px' },
              renderCell: (row) => {
                if (row.type === QuestionType.code) {
                  return (
                    <Stack direction={'row'} spacing={1} alignItems={'center'}>
                      <QuestionTypeIcon type={row.type} size={24} />
                      <CodeQuestionTypeIcon
                        codeType={row.code?.codeType}
                        size={18}
                      />
                      <LanguageIcon
                        language={row.code?.language}
                        size={18}
                        withLabel
                      />
                    </Stack>
                  )
                } else {
                  return <QuestionTypeIcon type={row.type} size={24} withLabel />
                }
              },
            },
            {
              label: 'Title',
              column: { flexGrow: 1 },
              renderCell: (row) => (
                <Typography variant={'body2'}>{row.title}</Typography>
              ),
            },
            {
              label: 'Tags',
              column: { width: '200px' },
              renderCell: (row) => (
                <QuestionTagsViewer
                  size={'small'}
                  tags={row.questionToTag}
                  collapseAfter={2}
                />
              ),
            },
            {
              label: 'Updated',
              column: { width: '90px' },
              renderCell: (row) => <DateTimeAgo date={new Date(row.updatedAt)} />,
            },
          ],
        }}
        items={questions.map((question) => ({
          ...question,
          meta: {
            key: question.id,
            onClick: () => {
                onRowClick && onRowClick(question)
            },
            actions: [
              <React.Fragment key="actions">
                <Tooltip title="Make a copy">
                  <IconButton
                    onClick={(ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      setSelected(question)
                      setCopyDialogOpen(true)
                    }}
                  >
                    <Image
                      alt={'Make a copy'}
                      src={'/svg/icons/copy.svg'}
                      width={16}
                      height={16}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Update in new page">
                  <IconButton
                    onClick={async (ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      await router.push(`/${groupScope}/questions/${question.id}`)
                    }}
                  >
                    <Image
                      alt={'Update in new page'}
                      src={'/svg/icons/update.svg'}
                      width={16}
                      height={16}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Update in overlay">
                  <IconButton
                    onClick={(ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      setSelected(question)
                      setOpenSideUpdate(true)
                    }}
                  >
                    <Image
                      alt={'Update in overlay'}
                      src={'/svg/icons/aside.svg'}
                      width={16}
                      height={16}
                    />
                  </IconButton>
                </Tooltip>
              </React.Fragment>,
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
          {
            groupBy: 'questionToTag',
            option: 'Tags',
            type: 'array',
            property: 'label',
            renderLabel: (row) => row.label,
          },
          {
            groupBy: 'type',
            option: 'Type',
            type: 'element',
            renderLabel: (row) => getTextByType(row.label),
          },
        ]}
      />
    )
  }

export default QuestionsGrid