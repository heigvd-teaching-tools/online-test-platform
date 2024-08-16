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
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Collapse, Icon, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { EvaluationPhase, Role, UserOnEvaluationAccessMode } from '@prisma/client'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import DisplayPhase from '../DisplayPhase'
import Image from 'next/image'
import { use, useEffect, useState } from 'react'

const phases = [
  EvaluationPhase.SETTINGS,
  EvaluationPhase.COMPOSITION,
  EvaluationPhase.REGISTRATION,
  EvaluationPhase.IN_PROGRESS,
  EvaluationPhase.GRADING,
  EvaluationPhase.FINISHED,
];

const phaseGreaterThan = (phase1, phase2) => {
  return phases.indexOf(phase1) > phases.indexOf(phase2)
}

const phaseToDetails = {
  [EvaluationPhase.SETTINGS]: {
    "menu": 'settings',
    "nextPhaseButton": {
      "label": "Go to composition",
    }
  },
  [EvaluationPhase.COMPOSITION]: {
    "menu": 'compose',
    "nextPhaseButton": {
      "label": "Go to registration",
    }
  },
  [EvaluationPhase.REGISTRATION]: {
    "menu": 'attendance',
    "nextPhaseButton": {
      "label": "Start evaluation",
    }
  },
  [EvaluationPhase.IN_PROGRESS]: 'progress',
  [EvaluationPhase.GRADING]: 'results',
  [EvaluationPhase.FINISHED]: 'results',
}

/*
enum EvaluationPhase {
  NEW
  DRAFT
  IN_PROGRESS
  GRADING
  FINISHED
}


*/

const EvaluationStepper = ({ evaluation }) => {
  const [phase, setPhase] = useState(0);

  const handleNext = () => {
    setPhase((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setPhase((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setPhase(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={phase}>
        {phases.map((currentPhase, index) => (
          <Step key={index}>
            <StepLabel>
              <DisplayPhase 
                phase={currentPhase} 
                disabled={index > phase}  // Disable steps after the current phase
              />
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};


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
      setActiveMenu(phaseToDetails[evaluation.phase].menu)
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
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <JoinClipboard evaluationId={evaluation.id} />
          <Stack direction={"row"} alignItems={"center"} justifyContent={"flex-end"} flex={1}>
              <EvaluationStepper evaluation={evaluation} />
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
          </Stack>
          <Stack flex={1}>
            <LayoutSplitScreen
              rightWidth={80}
              leftPanel={ 
                  <EvaluationSideMenu 
                    currentPhase={evaluation.phase}
                    active={activeMenu} 
                    setActive={(menu) => setActiveMenu(menu)}
                  />
              }
              rightPanel={
                <Stack spacing={1} flex={1} p={1} pt={2} border={"1px solid #e0e0e0"}>
                    {activeMenu === 'settings' && (
                      <EvaluationSettings 
                        groupScope={groupScope}
                        evaluation={evaluation}
                      />
                    )}
                    
                    {activeMenu === 'results' && evaluationToQuestions && (
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
              }
            />
          </Stack>
        </Stack>
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

const EvaluationSideMenu = ({ currentPhase, active, setActive }) => {

  const renderStatus = (phase) => {
    if (phaseGreaterThan(currentPhase, phase)) {
      return <StatusDisplay status={"SUCCESS"} />;
    } else if (currentPhase === phase) {
      return <StatusDisplay status={"NEUTRAL"} />;
    }
    return null; // Don't render for later phases
  };

  return (
    <MenuList>
      <MenuItem selected={active === 'settings'} onClick={() => setActive('settings')}>
        <ListItemIcon>
          <SettingsSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
        {renderStatus(EvaluationPhase.SETTINGS)}
      </MenuItem>


      <MenuItem selected={active === 'compose'} onClick={() => setActive('compose')}>
      <ListItemIcon>
          <FormatListNumberedSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Composition</ListItemText>
        <Typography variant="body2" color="text.secondary">
          12 questions
        </Typography>
        {renderStatus(EvaluationPhase.COMPOSITION)}
      </MenuItem>
      <MenuItem  selected={active === 'attendance'} onClick={() => setActive('attendance')}>
        <ListItemIcon>
          <PeopleSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Attendance</ListItemText>
        <Typography variant="body2" color="text.secondary">
          16 students
        </Typography>
        {renderStatus(EvaluationPhase.REGISTRATION)}
      </MenuItem>  
      <MenuItem disabled selected={active === 'progress'} onClick={() => setActive('progress')}>
        <ListItemIcon>
          <ModelTrainingSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Student Progress</ListItemText>
        <Typography variant="body2" color="text.secondary">
          78%
        </Typography>
        {renderStatus(EvaluationPhase.IN_PROGRESS)}
      </MenuItem>
      <MenuItem disabled selected={active === 'results'} onClick={() => setActive('results')}>
        <ListItemIcon>
          <GradingSharpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Grading & Results</ListItemText>
        <Typography variant="body2" color="text.secondary">
          34%
        </Typography>
        {renderStatus(EvaluationPhase.GRADING)}
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
import SettingsAccessMode from '../draft/SettingsAccessMode'
import SettingsSchedule from '../draft/SettingsSchedule'

const EvaluationSettings = ({ groupScope, evaluation }) => {

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
      <Stack spacing={2}>
        <Typography variant="h5">Evaluation settings</Typography>
        <Alert severity="info">
          <Typography variant="body2">
            A meaningful name of the evaluation. It will be displayed to the students.
          </Typography>
        </Alert>
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
        
        
        
        <Typography variant="h5">Conditions</Typography>
        <Alert severity="info">
          <Typography variant="body2">
            Conditions are optional. They can be used to specify the requirements and any rules or information for the students.Conditions are optional and may be utilized to outline specific requirements, rules, or information pertinent to students.
          </Typography>
          <Typography variant="body2">
          These may include prerequisites for participation, grading criteria, submission deadlines, attendance policies, or any other rules that ensure clarity and structure for the students.
          </Typography>
        </Alert>
        <Stack spacing={1} direction={"row"} alignItems={"center"}>
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
        
        
        <UpdateConditionsDialog 
          groupScope={groupScope}
          evaluation={evaluation}
          open={conditionsEditing}
          onClose={() => setConditionsEditing(false)}
        />

        <SettingsAccessMode 
          accessMode={evaluation.accessMode}
          accessList={evaluation.accessList}
          onChange={(accessMode, accessList) => {
            evaluation.accessMode = accessMode
            evaluation.accessList = accessList
          }}
        />

        <SettingsSchedule
          evaluation={evaluation}
          onChange={(duration) => {
            evaluation.durationHours = duration.hours
            evaluation.durationMins = duration.minutes
          }}
        />

      </Stack>
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
    />
  )
}

export default EvaluationPage
