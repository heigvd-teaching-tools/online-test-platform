import useSWR from 'swr'
import { useCallback, useEffect, useRef, useState } from 'react'
import LayoutMain from '../../layout/LayoutMain'
import LayoutSplitScreen from '../../layout/LayoutSplitScreen'
import { Role } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import QuestionFilter from '../../question/QuestionFilter'
import MainMenu from '../../layout/MainMenu'
import { Box, Button, ButtonGroup, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import { useSnackbar } from '../../../context/SnackbarContext'
import { useRouter } from 'next/router'
import AddQuestionDialog from '../list/AddQuestionDialog'
import QuestionListItem from '../list/QuestionListItem'
import AlertFeedback from '../../feedback/AlertFeedback'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'
import ScrollContainer from '../../layout/ScrollContainer'
import QuestionUpdate from '../../question/QuestionUpdate'
import ResizableDrawer from '../../layout/utils/ResizableDrawer'
import Image from 'next/image'

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
                <Stack spacing={2} padding={2} height={'100%'}>
                  <Stack
                    alignItems="center"
                    direction={'row'}
                    justifyContent={'space-between'}
                  >
                    <Typography variant="h6">
                      {questions.length} questions
                    </Typography>
                    <Button onClick={() => setAddDialogOpen(true)}>
                      Create a new question
                    </Button>
                  </Stack>
                  <ScrollContainer spacing={4} padding={1}>
                      <QuestionListContainer
                        questions={questions}
                        selected={selected}
                        setSelected={setSelected}
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

                  </ScrollContainer>
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


const QuestionListContainer = ({ questions, selected, setSelected }) => {

    const router = useRouter()

    const { groupScope } = router.query

    return (
    questions &&
      questions.map((question) => (
        <QuestionListItem
          key={question.id}
          selected={selected && selected.id === question.id}
          question={question}
          actions={[
            <ButtonGroup variant="contained" color="info" size="small">
              <Tooltip title="Update in new page">
                <Button
                  onClick={async () => {
                    await router.push(`/${groupScope}/questions/${question.id}`);
                  }}
                  startIcon={<Image src={'/svg/icons/update-white.svg'} width={16} height={16} />}
                >
                  Update
                </Button>
              </Tooltip>
              <Tooltip title="Update in overlay">
                <IconButton
                  onClick={() => setSelected(question)}
                >
                  <Image src={'/svg/icons/aside.svg'} width={16} height={16} />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          ]}
        />
      ))
    )
}

export default PageList
