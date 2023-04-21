import {QuestionType} from '@prisma/client';
import React, {useState} from "react";
import DialogFeedback   from "../../feedback/DialogFeedback";
import {Alert, Box, MenuItem, Stack, TextField, Typography} from "@mui/material";
import types from "../../question/types.json";
import DropDown from "../../input/DropDown";
import {useSession} from "next-auth/react";
import AlertFeedback from "../../feedback/AlertFeedback";
import QuestionTypeIcon from "../../question/QuestionTypeIcon";
import LanguageSelector from "../../question/type_specific/code/LanguageSelector";

import languages from "../../../code/languages.json";
import TypeSelector from "../../question/TypeSelector";
const defaultLanguage = languages.environments[0].language;

const AddQuestionDialog = ({ open, onClose, handleAddQuestion }) => {
    const { data: session } = useSession();
    const [ type, setType ] = useState(types[0].value);
    const [ language, setLanguage ] = useState(defaultLanguage);

    return (
      session?.user?.selected_group &&
      <DialogFeedback
        open={open}
        onClose={onClose}
        title={`Create new question in group ${session.user.selected_group.label}`}
        content={
          <Stack spacing={2}>
                <Typography variant="body1">Select the type of question you want to create</Typography>
                <Stack spacing={1} sx={{ width: '500px' }} direction={"row"} alignItems={"center"}>
                    <TypeSelector type={type} onChange={setType} />
                    <QuestionTypeIcon type={type} size={50} />
                </Stack>
              { type === QuestionType.code && (
                  <>
                      <Typography variant="body1">Select the language of the code question</Typography>
                      <LanguageSelector language={language} onChange={setLanguage} />
                  </>
              )}
              <AlertFeedback severity="warning">
                  <Typography variant="body1">You cannot change the type of a question after it has been created.</Typography>
              </AlertFeedback>
          </Stack>

        }
        onConfirm={() => handleAddQuestion(type, language)}
        />

    );
}

export default AddQuestionDialog;
