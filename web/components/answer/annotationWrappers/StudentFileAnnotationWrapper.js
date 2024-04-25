import { languageBasedOnPathExtension } from "@/code/utils";
import DialogFeedback from "@/components/feedback/DialogFeedback";
import DropdownSelector from "@/components/input/DropdownSelector";
import InlineDiffEditor from "@/components/input/InlineDiffEditor ";
import ResizePanel from "@/components/layout/utils/ResizePanel"
import FileEditor from "@/components/question/type_specific/code/FileEditor"
import { useTheme } from "@emotion/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

const { useAnnotation } = require("@/context/AnnotationContext")

const viewModes = [
  { value: 'ANNOTATED', label: 'Annotated' },
  { value: 'ORIGINAL', label: 'Original' },
  { value: 'DIFF', label: 'Diff' }
];


const ViewModeSelector = ({ currentViewMode, onViewModeChange }) => {
  
  // A function to format the label shown on the button
  const formatLabel = (option) => `View ${option.label}`;

  return (
    <Box zIndex={100}>
      <DropdownSelector
        size="small"
        label={formatLabel}
        color="info"
        options={viewModes}
        variant="outlined" // Change as needed: 'outlined', 'contained', etc.
        onSelect={onViewModeChange}
        value={currentViewMode}
      />
    </Box>
  );
};


const AnnotateToolbar = ({ readOnly, viewMode, setViewMode, state, onDiscard }) => {
  const theme = useTheme();
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  return state === "ANNOTATED" && (
    <>
    <Stack direction="row" alignItems="center" bgcolor={theme.palette.background.paper} position={"absolute"} right={0} top={0} p={1} zIndex={100} spacing={1}>
      <ViewModeSelector currentViewMode={viewMode} onViewModeChange={setViewMode} />
      {!readOnly && (
        <Button
          variant="text"
          size="small"
          onClick={(ev) => {
            ev.stopPropagation();
            setDiscardDialogOpen(true);
          }}
        >
          Discard
        </Button>
      )}
    </Stack>
    
    <DialogFeedback
      open={discardDialogOpen}
      title="Discard Annotation"
      content="Are you sure you want to discard this annotation?"
      onConfirm={() => {
        onDiscard();
        setViewMode("ANNOTATED");
        setDiscardDialogOpen(false);
      }}
      onCancel={() => setDiscardDialogOpen(false)}
    />
  </>
  );
};


const StudentFileAnnotationWrapper = ({ file:original }) => {

    const theme = useTheme()

    const { readOnly, state, annotation, change, discard } = useAnnotation()

    const [viewMode, setViewMode] = useState("ANNOTATED")
  
    const onChange = ({content}) => {
      change(content)
    }
  
    const hasAnnotation = annotation?.content !== undefined
  
    const file = {
      ...original,
      content: hasAnnotation ? annotation.content : original.content,
    }

    const language = languageBasedOnPathExtension(file?.path)
  
    return (
      <Stack>
        <AnnotateToolbar
          readOnly={readOnly}
          viewMode={viewMode}
          setViewMode={setViewMode}
          state={state}
          onDiscard={discard}
        />
      { viewMode === "ANNOTATED" || viewMode === "ORIGINAL" ? (
          <ResizePanel
            leftPanel={
              <FileEditor 
                file={file}
                readonlyPath
                readonlyContent={readOnly}
                onChange={onChange}
              />
            }
            rightPanel={
              <FileEditor 
                file={original}
                readonlyPath
                readonlyContent
              />
            }
            rightWidth={hasAnnotation && viewMode === "ORIGINAL" ? 40 : 0}
            hideHandle={!hasAnnotation || !viewMode === "ORIGINAL"}
          />
        ) : (
          <>
          <Stack direction="row" alignItems="center" p={2} bgcolor={theme.palette.background.paper}>
          <Typography variant="body1"> {file.path} </Typography>
          </Stack>
          <InlineDiffEditor
            readOnly={readOnly}
            original={file.content}
            modified={original.content}
            language={language}
            readOnly
            editorOptions={{
              readOnly: true,
              renderSideBySide: true,
              enableSplitViewResizing: true,
          }}
          />
        </>
        )}
      </Stack>
    )
  }

export default StudentFileAnnotationWrapper