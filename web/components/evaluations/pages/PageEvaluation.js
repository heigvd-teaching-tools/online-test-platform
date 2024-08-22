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
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Collapse, duration, Icon, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { EvaluationPhase, Role, UserOnEvaluationAccessMode } from '@prisma/client'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import DisplayPhase from '../DisplayPhase'
import Image from 'next/image'
import { use, useCallback, useEffect, useState } from 'react'

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
  [EvaluationPhase.IN_PROGRESS]: {
    "menu": 'progress',
    "nextPhaseButton": {
      "label": "End evaluation",
    }
  },
  [EvaluationPhase.GRADING]: {
    "menu": 'results',
    "nextPhaseButton": {
      "label": "Finish evaluation",
    }
  },
  [EvaluationPhase.FINISHED]: {
    "menu": 'results',
    "nextPhaseButton": {
      "label": "Finish evaluation",
    }
  }
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
    groupScope && evaluationId ? fetcher : null
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
      { evaluation && (
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
                    evaluation={evaluation}
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
                        onSettingsChanged={() => mutate()}
                      />
                    )}

                    {activeMenu === 'compose' && (
                        <Typography variant="body2">
                          {evaluationToQuestions && evaluationToQuestions.length} questions
                        </Typography>
                    )}

                    {activeMenu === 'attendance' && (
                      <Typography variant="body2">
                        {evaluationToQuestions && evaluationToQuestions.length} students
                      </Typography>
                    )}

                    {activeMenu === 'progress' && (
                      <Typography variant="body2">
                        {evaluationToQuestions && evaluationToQuestions.length} students
                      </Typography>
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
      )}
      
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


const SettingsSummary = ({ evaluation }) => {

  const isRestricted = evaluation.accessMode === UserOnEvaluationAccessMode.LINK_AND_ACCESS_LIST

  const isLabelDefined = evaluation.label && evaluation.label.length > 0

  return (
    <Stack spacing={0}>
      {!isLabelDefined && (
        <Typography variant="caption" color="error">
          - Label is required.
        </Typography>
      )}
      {isRestricted ? (
        <Typography variant="caption">
          - Restricted access
        </Typography>
      ) : (
        <Typography variant="caption">
          - Anyone with the link can access
        </Typography>
      )}
      {isRestricted && evaluation.accessList.length > 0 && (
        <Typography variant="caption" pl={2}>
          - {evaluation.accessList.length} students.
        </Typography>
      )}
      {evaluation.conditions ? (
        <Typography variant="caption">
          - Conditions are set.
        </Typography>
      ) : (
        <Typography variant="caption">
          - No conditions are set.
        </Typography>
      )}
      {evaluation.durationHours > 0 || evaluation.durationMins > 0 ? (
        <Typography variant="caption">
          - Duration: {evaluation.durationHours}h {evaluation.durationMins}m.
        </Typography>
      ) : (
        <Typography variant="caption">
          - No duration set.
        </Typography>
      )}
    </Stack>
  )
}

const CompositionSummary = ({ evaluation }) => {
  return (
    <Stack spacing={1}>
      <Typography variant="caption">- Has {evaluation.evaluationToQuestions?.length} questions.</Typography>
    </Stack>
  );
};

const AttendanceSummary = ({ evaluation }) => {
  return (
    <Stack spacing={1}>
      <Typography variant="caption">- {evaluation.participants?.length} students registered.</Typography>
      <Typography variant="caption">- {evaluation.deniedParticipants?.length} students denied.</Typography>
    </Stack>
  );
};

const ProgressSummary = ({ evaluation }) => {
  return (
    <Stack spacing={1}>
      <Typography variant="caption">- Progress: 78% completed.</Typography>
    </Stack>
  );
};

const GradingSummary = ({ evaluation }) => {



  return (
    <Stack spacing={1}>
      <Typography variant="caption">- {evaluation.participants?.length} students graded.</Typography>

    </Stack>
  );
};



const EvaluationMenuItem = ({ icon: Icon, label, details, summary, phase, currentPhase, active, setActive, menuKey }) => {
  
  const renderStatus = () => {
    if (phaseGreaterThan(currentPhase, phase)) {
      return <StatusDisplay status={"SUCCESS"} />;
    } else if (currentPhase === phase) {
      return <StatusDisplay status={"NEUTRAL"} />;
    }
    return <StatusDisplay status={"EMPTY"} />;
  };

  const disabled = phaseGreaterThan(phase, currentPhase)
  
  return (
    <>
    <MenuItem 
      selected={active === menuKey} 
      onClick={() => setActive(menuKey)} 
      disabled={disabled}
    >
      <ListItemIcon>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
      {details && (
        <Typography variant="body2" color="text.secondary">
          {details}
        </Typography>
      )}
      <Box ml={0.5}>
        {renderStatus()}
      </Box>    
    </MenuItem>
    {summary && (
        <Stack pt={1} pl={2} pb={2}>
            {summary}
        </Stack>
        )}
    </>
  );
};

const EvaluationSideMenu = ({ evaluation, currentPhase, active, setActive }) => {

  return (
    <MenuList>
      <EvaluationMenuItem
        icon={SettingsSharpIcon}
        label="Settings"
        phase={EvaluationPhase.SETTINGS}
        currentPhase={currentPhase}
        active={active}
        setActive={setActive}
        menuKey="settings"
        summary={<SettingsSummary evaluation={evaluation} />}
      />
      <EvaluationMenuItem
        icon={FormatListNumberedSharpIcon}
        label="Composition"
        details="12 questions"
        phase={EvaluationPhase.COMPOSITION}
        currentPhase={currentPhase}
        active={active}
        setActive={setActive}
        menuKey="compose"
        summary={<CompositionSummary evaluation={evaluation} />}
      />
      <EvaluationMenuItem
        icon={PeopleSharpIcon}
        label="Attendance"
        details="16 students"
        phase={EvaluationPhase.REGISTRATION}
        currentPhase={currentPhase}
        active={active}
        setActive={setActive}
        menuKey="attendance"
        summary={<AttendanceSummary evaluation={evaluation} />}
      />
      <EvaluationMenuItem
        icon={ModelTrainingSharpIcon}
        label="Student Progress"
        details="78%"
        phase={EvaluationPhase.IN_PROGRESS}
        currentPhase={currentPhase}
        active={active}
        setActive={setActive}
        menuKey="progress"
        summary={<ProgressSummary evaluation={evaluation} />}
      />
      <EvaluationMenuItem
        icon={GradingSharpIcon}
        label="Grading & Results"
        details="34%"
        phase={EvaluationPhase.GRADING}
        currentPhase={currentPhase}
        active={active}
        setActive={setActive}
        menuKey="results"
        summary={<GradingSummary evaluation={evaluation} />}
      />
    </MenuList>
  );
};


import EditIcon from '@mui/icons-material/Edit';
import StatusDisplay from '@/components/feedback/StatusDisplay'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import MarkdownEditor from '@/components/input/markdown/MarkdownEditor'
import JoinClipboard from '../JoinClipboard'
import StudentResultsGrid from '../finished/StudentResultsGrid'

import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import SettingsAccessMode from '../draft/SettingsAccessMode'
import SettingsSchedule from '../draft/SettingsSchedule'
import { useDebouncedCallback } from 'use-debounce'

const EvaluationSettings = ({ groupScope, evaluation, onSettingsChanged }) => {

  const { show: showSnackbar } = useSnackbar()

  const [label, setLabel] = useState(
    evaluation && evaluation.label ? evaluation.label : '',
  )

  const [conditions, setConditions] = useState(
    evaluation && evaluation.conditions ? evaluation.conditions : '',
  )

  useEffect(() => {
    if (evaluation) {
      setLabel(evaluation.label)
      setConditions(evaluation.conditions)
    }
  }
  , [evaluation, setLabel])

  const handleSave = useCallback(async (updatedProperties) => {
    return fetch(`/api/${groupScope}/evaluations/${evaluation.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(updatedProperties),
    }).then((response) => {
      if (response.ok) {
        onSettingsChanged()
      }

      response.json().then((data) => {
        showSnackbar(data.message, 'error')
      })
    }).catch(() => {
      showSnackbar('Error while saving evaluation', 'error')
    })
  }, [
    groupScope,
    evaluation,
    showSnackbar,
  ])

  const debounceSave = useDebouncedCallback(
    (updatedProperties) => {
      handleSave(updatedProperties)
    },
    750,
  )

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
          onChange={(e) => {
            setLabel(e.target.value)
            debounceSave({ label: e.target.value })
          }}
          helperText={!label ? 'Label is required' : ''}
        />
        
        <ConditionSettings
          groupScope={groupScope}
          conditions={conditions}
          onChange={(conditions) => {
            debounceSave({ conditions })
          }}
        />

        <SettingsAccessMode 
          accessMode={evaluation.accessMode}
          accessList={evaluation.accessList}
          onChange={(accessMode, accessList) => {
            debounceSave({ accessMode, accessList })
          }}
        />

        <SettingsSchedule
          active={evaluation.durationActive}
          duration={{
            hours: evaluation.durationHours,
            minutes: evaluation.durationMins,
          }}
          onChange={(duration) => {
            console.log("duration", duration)
            debounceSave({
              durationActive: duration.active,
              durationHours: duration.hours,
              durationMins: duration.minutes,
            })
          }}
        />

      </Stack>
  )
}

const ConditionSettings = ({ groupScope, conditions, onChange }) => {

  const [ conditionsEditing, setConditionsEditing ] = useState(false)

  return (
    <>
    <Typography variant="h5">Conditions</Typography>
    <Alert severity="info">
      <Typography variant="body2">
        Used to specify the requirements and any rules or information for the students. 
      </Typography>
      <Typography variant="body2">
        These may include prerequisites for participation, grading criteria, submission deadlines, attendance policies, or any other rules that ensure clarity and structure for the students.
      </Typography>
    </Alert>
    <Stack spacing={1} direction={"row"} alignItems={"center"}>
        {conditions ? (
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <StatusDisplay status={"SUCCESS"} />
            <Typography variant="caption">Conditions are set, length: {conditions.length}</Typography>
            <IconButton
              variant="text"
              color={"info"}
              size="small"
              onClick={() => setConditionsEditing(!conditionsEditing)}
            >
              <EditIcon />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <StatusDisplay status={"MISSING"} />
            <Typography variant="caption">No conditions set</Typography>
            <IconButton
              onClick={() => setConditionsEditing(!conditionsEditing)}
              size="small"
              color={"info"}
            >
              <EditIcon />
            </IconButton>

          </Stack>
        )}
    </Stack>
    <UpdateConditionsDialog 
      groupScope={groupScope}
      conditions={conditions}
      open={conditionsEditing}
      onClose={() => setConditionsEditing(false)}
      onConditionsChanged={(value) => {
        onChange(value)
      }}
    />

    </>
  )
}


const UpdateConditionsDialog = ({ groupScope, conditions, open, onClose, onConditionsChanged }) => {
  
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
            rawContent={conditions}
            onChange={(value) => {
              onConditionsChanged(value)
            }}
          />
        </Stack>
      }
    />
  )
}

export default EvaluationPage
