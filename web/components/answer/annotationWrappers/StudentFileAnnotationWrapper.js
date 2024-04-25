import { languageBasedOnPathExtension } from "@/code/utils";
import DialogFeedback from "@/components/feedback/DialogFeedback";
import DropdownSelector from "@/components/input/DropdownSelector";
import InlineDiffEditor from "@/components/input/InlineDiffEditor ";
import InlineMonacoEditor from "@/components/input/InlineMonacoEditor";
import ResizePanel from "@/components/layout/utils/ResizePanel"
import FileEditor from "@/components/question/type_specific/code/FileEditor"
import { useTheme } from "@emotion/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { set } from "lodash";
import { useEffect, useState } from "react";

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
    <Stack direction="row" alignItems="center" bgcolor={theme.palette.background.paper} zIndex={100} spacing={1}>
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
      <DialogFeedback
        open={discardDialogOpen}
        title="Discard Annotation"
        content="Are you sure you want to discard this annotation?"
        onConfirm={() => {
          onDiscard();
          setViewMode("ANNOTATED");
          setDiscardDialogOpen(false);
        }}
        onClose={() => setDiscardDialogOpen(false)}
      />
    </Stack>
  );
};

const StudentFileAnnotationWrapper = ({ file:original }) => {

    const theme = useTheme()

    const { readOnly, state, annotation, change, discard } = useAnnotation()

    const [viewMode, setViewMode] = useState("ANNOTATED")

    useEffect(() => {
      setViewMode("ANNOTATED")
    }, [original])
  
    const onChange = (content) => {
      change(content)
    }
  
    const hasAnnotation = annotation?.content !== undefined
  
    const file = {
      ...original,
      content: hasAnnotation ? annotation.content : original.content,
    }

    const language = languageBasedOnPathExtension(file?.path)
  
    return (
      <Stack position={"relative"}>
        <Stack 
          position={"sticky"} top={0} 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          bgcolor={theme.palette.background.paper} 
          zIndex={1000} 
          height={50}
        >
          <Box flex={1} pl={1}>
            <Typography variant="body1"> {file.path} </Typography>
          </Box>
          <AnnotateToolbar
            readOnly={readOnly}
            viewMode={viewMode}
            setViewMode={setViewMode}
            state={state}
            onDiscard={discard}
          />
        </Stack>
        <ResizePanel
          leftPanel={
            viewMode === "ANNOTATED" || viewMode === "ORIGINAL" ? (
              <InlineMonacoEditor 
                code={file.content}
                readOnly={readOnly}
                onChange={onChange}
                language={language}
              />
            ) : (
              <InlineDiffEditor
                readOnly
                original={file.content}
                modified={original.content}
                language={language}
                editorOptions={{
                  readOnly: true,
                  renderSideBySide: true,
                  enableSplitViewResizing: true,
              }}
              />
            )
          }
          rightPanel={
            <InlineMonacoEditor
              code={original.content}
              readOnly
              language={language}
            />
          }
          rightWidth={hasAnnotation && viewMode === "ORIGINAL" ? 40 : 0}
          hideHandle={!hasAnnotation || !viewMode === "ORIGINAL"}
        />
      
      </Stack>
    )
  }

export default StudentFileAnnotationWrapper