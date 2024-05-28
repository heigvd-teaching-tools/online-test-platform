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
import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import { AnnotationState, EditingState } from './types'
import { useTheme } from '@emotion/react'
import UserHelpPopper from '@/components/feedback/UserHelpPopper'

const AnnotationHighlight = ({ readOnly, state, children }) => {
  const theme = useTheme()

  const [editingState, setEditingState] = useState(EditingState.INACTIVE.value)

  useEffect(() => {
    if (state === AnnotationState.NOT_ANNOTATED.value) {
      setEditingState(EditingState.INACTIVE.value)
    }
  }, [state])

  const onMouseEnter = useCallback(() => {
    if (readOnly) {
      return
    }
    if (
      editingState !== EditingState.ACTIVE.value &&
      state !== AnnotationState.ANNOTATED.value
    ) {
      setEditingState(EditingState.HOVER.value)
    }
  }, [editingState, state, readOnly])

  const onMouseLeave = useCallback(() => {
    if (readOnly) {
      return
    }
    if (editingState !== EditingState.ACTIVE.value) {
      setEditingState(EditingState.INACTIVE.value)
    }
  }, [editingState, readOnly])

  const onClickHandler = useCallback(() => {
    if (readOnly) {
      return
    }
    setEditingState(EditingState.ACTIVE.value)
  }, [readOnly])

  return (
    <ClickAwayListener
      onClickAway={() => {
        setEditingState(EditingState.INACTIVE.value)
      }}
    >
      <Box
        position={'relative'}
        m={0}
        p={0}
        transition={'box-shadow 0.25s ease-in-out'}
        cursor={'pointer'}
        boxSizing={'border-box'}
        {...getCss(editingState, state)}
        onMouseEnter={() => onMouseEnter()}
        onMouseLeave={() => onMouseLeave()}
        onClick={() => onClickHandler()}
      >
        {editingState === EditingState.HOVER.value && <HoverInfoMessage />}

        {children}
      </Box>
    </ClickAwayListener>
  )
}

const HoverInfoMessage = () => {
  const theme = useTheme()
  return (
    <Stack
      position={'absolute'}
      top={0}
      right={0}
      zIndex={10000}
      bgcolor={theme.palette.background.paper}
      p={1}
    >
      <UserHelpPopper label={'Start editing to provide feedback'}>
        <Typography variant={'body1'}>
          Feel free to annotate the student&apos;s answer with your feedback.
        </Typography>
        <Typography variant={'body1'}>
          You can add comments to the student&apos;s proposal or even suggest
          fixes.
        </Typography>
        <Typography variant={'body1'}>
          The original answer will be preserved.
        </Typography>
        <Typography variant={'body1'}>
          Your feedback will be given to the student in the form of a code diff.
        </Typography>
      </UserHelpPopper>
    </Stack>
  )
}

const getCss = (editingState, annotationState) =>
  EditingState[editingState]?.css || AnnotationState[annotationState]?.css

export default AnnotationHighlight
