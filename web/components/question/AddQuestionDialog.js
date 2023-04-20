import {useState} from "react";
import DialogFeedback   from "../feedback/DialogFeedback";
import {Alert, Box, MenuItem, Stack, TextField, Typography} from "@mui/material";
import {useSnackbar} from "../../context/SnackbarContext";
import {useInput} from "../../utils/useInput";
import types from "./types.json";
import DropDown from "../input/DropDown";
import Image from "next/image";
import {useSession} from "next-auth/react";
import AlertFeedback from "../feedback/AlertFeedback";

const AddQuestionDialog = ({ open, onClose, handleAddQuestion }) => {
    const { data: session } = useSession();
    const [ type, setType ] = useState(types[0].value);

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
                    <Box sx={{ width:52, height:52 }}>
                        <Image alt="Question Type Icon" src={`/svg/questions/${type}.svg`} layout="responsive" width="52px" height="52px" priority="1" />
                    </Box>
                    <DropDown id="question" name="Type" defaultValue={type} minWidth="160px" onChange={setType}>
                        {types?.map(({value, label}) =>
                            <MenuItem key={value} value={value}>
                                <Typography variant="caption">{label}</Typography>
                            </MenuItem>
                        )}
                    </DropDown>
                </Stack>
              <AlertFeedback severity="warning">
                  <Typography variant="body1">You cannot change the type of a question after it has been created.</Typography>
              </AlertFeedback>
          </Stack>

        }
        onConfirm={() => handleAddQuestion(type)}
        />

    );
}

export default AddQuestionDialog;
