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
import { fetcher } from '@/code/utils'
import Loading from '@/components/feedback/Loading'
import BackButton from '@/components/layout/BackButton'
import LayoutMain from '@/components/layout/LayoutMain'
import Authorization from '@/components/security/Authorization'
import { useSnackbar } from '@/context/SnackbarContext'
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Icon, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, TextField, Tooltip, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { EvaluationPhase, Role, UserOnEvaluationAccessMode } from '@prisma/client'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import DisplayPhase from '../DisplayPhase'
import Image from 'next/image'
import { use, useEffect, useState } from 'react'

const menuToPhase = {
  [EvaluationPhase.DRAFT]: 'compose',
  [EvaluationPhase.IN_PROGRESS]: 'progress',
  [EvaluationPhase.GRADING]: 'results',
  [EvaluationPhase.FINISHED]: 'results',
}


const EvaluationPage = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { show: showSnackbar } = useSnackbar()

  

  const {
    data: evaluation,
    error,
    mutate,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
    {
      fallbackData: {
        id: undefined,
        label: '',
        conditions: '',
        accessMode: UserOnEvaluationAccessMode.LINK_ONLY,
        accessList: [],
      },
    },
  )

  const [ activeMenu, setActiveMenu ] = useState(null)

  useEffect(() => {
    if (evaluation) {
      setActiveMenu(menuToPhase[evaluation.phase])
    }
  }, [evaluation])

  
  const { data: evaluationToQuestions, error: errorQuestions } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/questions?withGradings=true`,
    groupScope && evaluationId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading error={[error]} loading={!evaluation}>
      <LayoutMain
        hideLogo
        header={
          <Stack direction="row" alignItems="center">
            <BackButton backUrl={`/${groupScope}/evaluations`} />
            {evaluation.id && (
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {evaluation.label}
              </Typography>
            )}
          </Stack>
        }
        padding={0}
      >
        <Stack spacing={1} flex={1} p={1}>
          <JoinClipboard evaluationId={evaluation.id} />
          <LayoutSplitScreen
            leftPanel={ 
                <EvaluationSideMenu active={activeMenu} />
            }
            rightPanel={
              <Stack spacing={1} flex={1} p={1}>
                <Stack spacing={1} alignItems={"flex-start"}>
                  
                  {evaluationToQuestions && (
                    <WidgetCard title="Students results">
                      <StudentResultsGrid
                          evaluationToQuestions={evaluationToQuestions}
                          actions={(row) => {
                            return (
                              <Tooltip
                                title="View student's answers"
                                key="view-student-answers"
                              >
                                <a
                                  href={`/${groupScope}/evaluations/${evaluationId}/consult/${row.participant.email}/1`}
                                  target="_blank"
                                >
                                  <IconButton size="small">
                                    <Image
                                      alt="View"
                                      src="/svg/icons/view-user.svg"
                                      width="18"
                                      height="18"
                                    />
                                  </IconButton>
                                </a>
                              </Tooltip>
                            )
                          }}
                          questionCellClick={async (questionId, participantId) => {
                            const questionOrder =
                            evaluationToQuestions.findIndex(
                                (jstq) => jstq.question.id === questionId,
                              ) + 1
                            const participantEmail = participants.find(
                              (p) => p.id === participantId,
                            ).email
                            await router.push(
                              `/${groupScope}/evaluations/${evaluationId}/consult/${participantEmail}/${questionOrder}`,
                            )
                          }}
                        />
                    </WidgetCard>
                  )}
                  

                </Stack>
              </Stack>
            }
          />
        </Stack>
        <Card variant='outlined'>
          <CardActions>
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <DisplayPhase phase={evaluation.phase} /> 
              {evaluation.phase === EvaluationPhase.DRAFT && (
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
                  Start Evaluation
                </Button>
              )}
            </Stack>
            </CardActions>
        </Card>

        </LayoutMain>
      </Loading>
    </Authorization>
  )
}

import MoreVertIcon from '@mui/icons-material/MoreVert'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

const WidgetCard = ({ title, open = true, summary, children }) => {
  const [isOpen, setIsOpen] = useState(open)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Card variant='outlined'>
      <CardHeader
        sx={{ pt: 1, pl: 1, pr: 1, pb: 1, cursor: 'pointer', userSelect: 'none' }}
        title={<Typography variant="h6">{title}</Typography>}
        onClick={handleToggle}
        action={
          <IconButton
            aria-label="toggle content visibility"
          >
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={isOpen}>
        <CardContent sx={{ p: 0 }}>
          {children}
        </CardContent>
      </Collapse>
      {!isOpen && summary && (
        <Box sx={{ p: 1 }}>
          {summary}
        </Box>
      )}
    </Card>
  )
}

import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import FormatListNumberedSharpIcon from '@mui/icons-material/FormatListNumberedSharp';
import PeopleSharpIcon from '@mui/icons-material/PeopleSharp';
import ModelTrainingSharpIcon from '@mui/icons-material/ModelTrainingSharp';
import GradingSharpIcon from '@mui/icons-material/GradingSharp';

const EvaluationSideMenu = ({ active}) => {

  return (
    <MenuList>
      <MenuItem selected={active === 'settings'}>
        <ListItemIcon>
          <SettingsSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>


      <MenuItem selected={active === 'compose'}>
      <ListItemIcon>
          <FormatListNumberedSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Composition</ListItemText>
        <Typography variant="body2" color="text.secondary">
          12 questions
        </Typography>
      </MenuItem>
      <MenuItem  selected={active === 'registration'}>
        <ListItemIcon>
          <PeopleSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Attendance</ListItemText>
        <Typography variant="body2" color="text.secondary">
          16 students
        </Typography>
      </MenuItem>  
      <MenuItem disabled selected={active === 'progress'}>
        <ListItemIcon>
          <ModelTrainingSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Student Progress</ListItemText>
        <Typography variant="body2" color="text.secondary">
          78%
        </Typography>
      </MenuItem>
      <MenuItem disabled selected={active === 'results'}>
        <ListItemIcon>
          <GradingSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Grading & Results</ListItemText>
        <Typography variant="body2" color="text.secondary">
          34%
        </Typography>
      </MenuItem>


    </MenuList>
  )
}




import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import StatusDisplay from '@/components/feedback/StatusDisplay'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import MarkdownEditor from '@/components/input/markdown/MarkdownEditor'
import JoinClipboard from '../JoinClipboard'
import StudentsInEvaluation from '../draft/StudentsInEvaluation'
import DeniedStudentsInEvaluation from '../draft/DeniedStudentsInEvaluation'
import ScrollContainer from '@/components/layout/ScrollContainer'
import StudentResultsGrid from '../finished/StudentResultsGrid'

import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
const EvaluationGeneralInformation = ({ groupScope, evaluation }) => {

  const [ labelEditing, setLabelEditing ] = useState(false)
  const [ conditionsEditing, setConditionsEditing ] = useState(false)

  const [label, setLabel] = useState(
    evaluation && evaluation.label ? evaluation.label : '',
  )

  const [errorLabel, setErrorLabel] = useState(false)

  useEffect(() => {
    if (evaluation) {
      setLabel(evaluation.label)
    }
  }
  , [evaluation, setLabel])

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
              {labelEditing ? (
                <TextField
                  label="Label"
                  id="evaluation-label"
                  fullWidth
                  value={label}
                  size="small"
                  onChange={(e) => setLabel(e.target.value)}
                  error={errorLabel ? true : false}
                  helperText={errorLabel ? 'Label is required' : ''}
                />
              ) : (
                  <Box onClick={() => setLabelEditing(!labelEditing)}>
                  <Typography variant="body1">{label}</Typography>
                  </Box>
                
              )}
              <Tooltip title="Edit label">
              <IconButton
                onClick={() => setLabelEditing(!labelEditing)}
                size="small"
              >
                {labelEditing ? <SaveOutlinedIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
              <Typography variant="h6">Conditions:</Typography>
              {evaluation.conditions ? (
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                  <StatusDisplay status={"SUCCESS"} />
                  <Typography variant="caption">Conditions are set, length: {evaluation.conditions.length}</Typography>
                  <Button
                    variant="text"
                    color="warning"
                    size="small"
                    onClick={() => setConditionsEditing(!conditionsEditing)}
                  >
                    Edit conditions
                  </Button>
                </Stack>
              ) : (
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                  <StatusDisplay status={"MISSING"} />
                  <Typography variant="caption">No conditions set</Typography>
                  <IconButton
                    onClick={() => setConditionsEditing(!conditionsEditing)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>

                </Stack>
              )}
          </Stack>
            
        </Stack>
        
      </CardContent>
      <UpdateConditionsDialog 
        groupScope={groupScope}
        evaluation={evaluation}
        open={conditionsEditing}
        onClose={() => setConditionsEditing(false)}
      />
    </Card>
  )
}


const UpdateConditionsDialog = ({ groupScope, evaluation, open, onClose }) => {
  const [conditions, setConditions] = useState(
    evaluation ? evaluation.conditions : '',
  )

  const [conditionHeight, setConditionHeight] = useState(150)

  useEffect(() => {
    if (conditions && conditions.length > 0) {
      setConditionHeight(800)
    } else {
      setConditionHeight(150)
    }
  }, [conditions])

  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title="Update conditions"
      content={
        <Stack spacing={2} width={`80vw`} height={`70vh`}>
          <MarkdownEditor
            id={`conditions`}
            title="Conditions"
            groupScope={groupScope}
            value={conditions}
            onChange={(value) => setConditions(value)}
            height={conditionHeight}
          />
        </Stack>
      }
      actions={
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="text"
            color="error"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              await update(groupScope, evaluation.id, {
                conditions,
              })
                .then(async (response) => {
                  if (response.ok) {
                    mutate(await response.json(), false)
                    showSnackbar('Conditions updated')
                    onClose()
                  } else {
                    response.json().then((json) => {
                      showSnackbar(json.message, 'error')
                    })
                  }
                })
                .catch(() => {
                  showSnackbar('Error during conditions update', 'error')
                })
            }}
          >
            Save
          </Button>
        </Stack>
      }
    />
  )
}

export default EvaluationPage
