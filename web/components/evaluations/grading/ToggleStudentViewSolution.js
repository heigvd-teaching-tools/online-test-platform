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
import { useCallback, useEffect, useState } from 'react'
import { update } from '../pages/crud'
import { FormControlLabel, Switch } from '@mui/material'

const ToggleStudentViewSolution = ({ groupScope, evaluation }) => {
  const [saving, setSaving] = useState(false)
  const [showSolutionsWhenFinished, setShowSolutionsWhenFinished] = useState(
    evaluation.showSolutionsWhenFinished,
  )

  const save = useCallback(
    async (checked) => {
      console.log('Saving')
      if (saving) return
      if (!evaluation) return
      setSaving(true)
      await update(groupScope, evaluation.id, {
        showSolutionsWhenFinished: checked,
      })
      setSaving(false)
    },
    [groupScope, evaluation, saving],
  )

  useEffect(() => {
    setShowSolutionsWhenFinished(evaluation.showSolutionsWhenFinished)
  }, [evaluation.showSolutionsWhenFinished])

  return (
    <FormControlLabel
      control={
        <Switch
          checked={showSolutionsWhenFinished}
          onChange={(e) => {
            const checked = e.target.checked
            setShowSolutionsWhenFinished(checked)
            save(checked)
          }}
        />
      }
      label="Allow student to view official solutions"
    />
  )
}

export default ToggleStudentViewSolution
