import { useCallback, useEffect, useState } from "react"
import { update } from "../pages/crud"
import { FormControlLabel, Switch } from "@mui/material"

const ToggleStudentViewSolution = ({ groupScope, evaluation }) => {
  
    const [ saving, setSaving ] = useState(false)
    const [ showSolutionsWhenFinished, setShowSolutionsWhenFinished ] = useState(evaluation.showSolutionsWhenFinished)

    const save = useCallback(async () => {
        if (saving) return
        if(!evaluation) return
        setSaving(true)
        await update(groupScope, evaluation.id, {
        showSolutionsWhenFinished: showSolutionsWhenFinished,
        })
        setSaving(false)
    }, [groupScope, evaluation, showSolutionsWhenFinished])

    useEffect(() => {
        setShowSolutionsWhenFinished(evaluation.showSolutionsWhenFinished)
    }, [evaluation.showSolutionsWhenFinished])

    useEffect(() => {
        save()
    }, [showSolutionsWhenFinished])

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={showSolutionsWhenFinished}
                    onChange={(e) => {
                        setShowSolutionsWhenFinished(e.target.checked)
                    }}
                />
            }
            label="Allow student to view official solutions"
        />
    )
}

export default ToggleStudentViewSolution