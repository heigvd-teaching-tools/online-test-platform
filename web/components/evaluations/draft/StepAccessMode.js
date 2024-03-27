import TagsSelector from "@/components/input/TagsSelector"
import { Alert, AlertTitle, FormControlLabel, FormGroup, Stack, Switch, Typography } from "@mui/material"
import { UserOnEvaluatioAccessMode } from "@prisma/client"
import { useEffect, useState } from "react"

const StepAccessMode = ({ evaluation, onChange }) => {

    const [accessMode, setAccessMode] = useState(evaluation?.accessMode || UserOnEvaluatioAccessMode.LINK_ONLY)
    const [accessList, setAccessList] = useState(evaluation?.accessList || [])

    useEffect(() => {
        if(evaluation.id){
            setAccessMode(evaluation.accessMode)
            setAccessList(evaluation.accessList)
        }
    }, [evaluation.id, evaluation])

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Access mode</Typography>
            <Stack spacing={2}>
                <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={accessMode === UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST}
                            onChange={(e) => {
                                const newAccessMode = e.target.checked ? UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST : UserOnEvaluatioAccessMode.LINK_ONLY
                                setAccessMode(newAccessMode)
                                onChange(newAccessMode, accessList)
                            }}
                        />
                    }
                    label="Restricted to access list"
                />
                </FormGroup>
                { accessMode === UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST &&
                (
                    <>
                    <Typography variant="body1">Provide a list of email addresses to restrict access to the evaluation.</Typography>
                    <TagsSelector
                        label="Access list"
                        value={accessList}
                        options={[]}
                        validateTag={tag => {
                            return tag.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
                        }}
                        formatTag={tag => {
                            // Try to find an email address anywhere within the string
                            const match = tag.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                            if (match && match[0]) {
                            // If an email address is found, return it in lowercase
                            const email = match[0].toLowerCase();
                            return email;
                            }
                            // If no email address is found, return the tag as is, it will be invalid anyway            
                            return tag;
                        }}
                        
                        onChange={(emails) => {
                            setAccessList(emails)
                            onChange(accessMode, emails)
                        }}
                    />
                    {
                    accessList.length === 0 &&
                    <Alert severity="warning">
                        <AlertTitle>Access list is empty</AlertTitle>
                        Please provide at least one email address to restrict access to the evaluation.
                    </Alert>
                    }

                    {
                    accessList.length > 0 &&
                    <Alert severity="info">
                        <AlertTitle>Access list</AlertTitle>
                        <Typography variant="body1">
                        Access list contains {accessList.length} email addresses.
                        </Typography>
                    </Alert>
                    }
                    </>
                )
                }
            </Stack>
        </Stack>
    )
}

export default StepAccessMode