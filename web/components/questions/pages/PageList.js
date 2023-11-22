import useSWR from 'swr'
import React, { useCallback, useState } from 'react'
import LayoutMain from '../../layout/LayoutMain'
import LayoutSplitScreen from '../../layout/LayoutSplitScreen'
import { QuestionType, Role } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import QuestionFilter from '../../question/QuestionFilter'
import MainMenu from '../../layout/MainMenu'
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useSnackbar } from '../../../context/SnackbarContext'
import { useRouter } from 'next/router'
import AddQuestionDialog from '../list/AddQuestionDialog'
import AlertFeedback from '../../feedback/AlertFeedback'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'
import ScrollContainer from '../../layout/ScrollContainer'
import QuestionUpdate from '../../question/QuestionUpdate'
import ResizableDrawer from '../../layout/utils/ResizableDrawer'
import Image from 'next/image'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import QuestionTagsViewer from '@/components/question/tags/QuestionTagsViewer'
import DateTimeAgo from '@/components/feedback/DateTimeAgo'
import GridGrouping from '@/components/ui/GridGrouping'
import { weeksAgo } from '../list/utils'
import { getTextByType } from '@/components/question/types'
import LanguageIcon from '@/components/question/type_specific/code/LanguageIcon'

const PageList = () => {
  const router = useRouter()

  const { groupScope } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [queryString, setQueryString] = useState(undefined)

  const {
    data: questions,
    error,
    mutate,
  } = useSWR(
    `/api/${groupScope}/questions${
      queryString ? `?${new URLSearchParams(queryString).toString()}` : ''
    }`,
      groupScope ? fetcher : null
  )

  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [ selected, setSelected ] = useState(undefined)

  const createQuestion = useCallback(
    async (type, language) => {
      // language only used for code questions
      await fetch(`/api/${groupScope}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          type,
          language,
        }),
      })
        .then((res) => res.json())
        .then(async (createdQuestion) => {
          showSnackbar('Question created', 'success')
          await mutate([...questions, createdQuestion])
          await router.push(`/${groupScope}/questions/${createdQuestion.id}`)
        })
        .catch(() => {
          showSnackbar('Error creating questions', 'error')
        })
    },
    [groupScope, router, showSnackbar, questions, mutate]
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!questions} errors={[error]}>
        <LayoutMain header={<MainMenu />}>
          <LayoutSplitScreen
            leftPanel={<QuestionFilter onApplyFilter={setQueryString} />}
            rightWidth={80}
            rightPanel={
              questions && (
                <Stack height={'100%'} p={1} pt={2}>
                    <QuestionsGrid 
                      questions={questions} 
                      setAddDialogOpen={setAddDialogOpen}
                      setSelected={setSelected}
                      groupScope={groupScope}
                    />
                  <ResizableDrawer
                    open={selected !== undefined}
                    onClose={() => setSelected(undefined)}
                  >
                    <Box pt={2} width={"100%"} height={"100%"}>
                      { selected && (
                          <QuestionUpdate
                            groupScope={router.query.groupScope}
                            questionId={selected.id}
                            onUpdate={async (question) => {
                              await mutate()
                              setSelected(question)
                            }}
                            onDelete={async () => {
                              await mutate()
                              setSelected(undefined)
                            }}
                          />
                        )
                      }
                    </Box>
                  </ResizableDrawer>

                  {questions && questions.length === 0 && (
                    <AlertFeedback severity="info">
                      <Typography variant="body1">
                        No questions found in this group. Try changing your
                        search criteria
                      </Typography>
                    </AlertFeedback>
                  )}
                </Stack>
              )
            }
          />
          <AddQuestionDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            handleAddQuestion={async (type, language) => {
              await createQuestion(type, language)
              setAddDialogOpen(false)
            }}
          />
        </LayoutMain>
      </Loading>
    </Authorisation>
  )
}

const QuestionsGrid = ({ groupScope, questions, setAddDialogOpen, setSelected }) => {

  const router = useRouter()

  return (
    <GridGrouping
      label="Questions"
      actions={
        <Button onClick={() => setAddDialogOpen(true)}>
          Create a new question
        </Button>
      }
      header={{
        actions: {
          label: 'Actions',
          width: '80px',
        },
        columns: [
          {
            label: 'Type',
            column: { width: '140px' },
            renderCell: (row) => {
              if(row.type === QuestionType.code){
                return (
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <QuestionTypeIcon 
                      type={row.type} 
                      size={24} 
                      
                    />
                    <LanguageIcon language={row.code?.language} size={18} />
                  </Stack>
                )
              }
              return (
                <QuestionTypeIcon 
                  type={row.type} 
                  size={24} 
                  withLabel 
                />,
              )
            }
          },
          {
            label: 'Title',
            column: { flexGrow: 1 },
            renderCell: (row) => <Typography variant={"body2"}>{row.title}</Typography>
          },
          {
            label: 'Tags',
            column: { width: '200px' },
            renderCell: (row) => <QuestionTagsViewer size={'small'} tags={row.questionToTag} collapseAfter={2} />
          },
          {
            label: 'Updated',
            column: { width: '90px' },
            renderCell: (row) => <DateTimeAgo date={new Date(row.updatedAt)} />
          },
        ],
      }}

      items={questions.map((question) => ({
        ...question,
        meta:{
          key: question.id,
          actions: [
            <React.Fragment key="actions">
              <Tooltip title="Update in new page">
                <IconButton
                  onClick={async () => {
                    await router.push(`/${groupScope}/questions/${question.id}`);
                  }}
                >
                  <Image src={'/svg/icons/update.svg'} width={16} height={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Update in overlay">
                <IconButton
                  onClick={() => setSelected(question)}
                >
                  <Image src={'/svg/icons/aside.svg'} width={16} height={16} />
                </IconButton>
              </Tooltip>
            </React.Fragment>
        ]
        }
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
          option: 'Question Type',
          type: 'element',
          renderLabel: (row) => getTextByType(row.label),
        }
      ]}
    />
  )
}

export default PageList
