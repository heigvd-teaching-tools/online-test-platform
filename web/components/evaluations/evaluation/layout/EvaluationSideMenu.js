import { ListItemIcon, ListItemText, MenuItem, MenuList, Typography } from "@mui/material";
import { EvaluationPhase, UserOnEvaluationAccessMode } from "@prisma/client";

import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import FormatListNumberedSharpIcon from '@mui/icons-material/FormatListNumberedSharp';
import PeopleSharpIcon from '@mui/icons-material/PeopleSharp';
import ModelTrainingSharpIcon from '@mui/icons-material/ModelTrainingSharp';
import GradingSharpIcon from '@mui/icons-material/GradingSharp';
import { Box, Stack } from "@mui/system";
import { phaseGreaterThan } from "../phases";
import StatusDisplay from "@/components/feedback/StatusDisplay";


const EvaluationSideMenu = ({ evaluation, composition, attendance, currentPhase, active, setActive }) => {
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
            details={`${composition?.length || 0} questions`}
            phase={EvaluationPhase.COMPOSITION}
            currentPhase={currentPhase}
            active={active}
            setActive={setActive}
            menuKey="compose"
            summary={<CompositionSummary evaluation={evaluation} composition={composition} />}
        />
        <EvaluationMenuItem
            icon={PeopleSharpIcon}
            label="Attendance"
            details={`${attendance.registered.length} students`}
            phase={EvaluationPhase.REGISTRATION}
            currentPhase={currentPhase}
            active={active}
            setActive={setActive}
            menuKey="attendance"
            summary={<AttendanceSummary attendance={attendance} />}
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
    {summary && !disabled && (
        <Stack pt={1} pl={2} pb={2}>
            {summary}
        </Stack>
        )}
    </>
  );
};

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
            - Access list contains {evaluation.accessList.length} students
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
  
  const CompositionSummary = ({ evaluation, composition }) => {
    return (
      <Stack>
        <Typography 
          variant="caption"
          color={composition?.length === 0 ? "error" : "text.primary"}
        >
          - {composition?.length} questions.
        </Typography>
        <Typography variant="caption">- {composition?.reduce((acc, q) => acc + q.points, 0)} points.</Typography>
         { 
          phaseGreaterThan(evaluation.phase, EvaluationPhase.COMPOSITION) ? (
            <>
            <Typography variant="caption"> - Composition is completed.</Typography>
            <Typography variant="caption"> - Questions are copied to the evaluation.</Typography>
            </>
          ) : (
            <>
            <Typography variant="caption">- Composition is open for changes.</Typography>
            <Typography variant="caption">- Questions are linked to the evaluation.</Typography>
            </>
          )
        }
      </Stack>
    );
  };
  
  const AttendanceSummary = ({ attendance }) => {
    return (
      <Stack>
        <Typography variant="caption">- {attendance.registered?.length} students registered.</Typography>
        {attendance.denied?.length > 0 && <Typography variant="caption" color={"error"}>- {attendance.denied?.length} students denied.</Typography>}
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
  

export default EvaluationSideMenu
  