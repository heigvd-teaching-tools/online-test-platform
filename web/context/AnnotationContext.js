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
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { AnnotationEntityType, Role } from '@prisma/client'
import { fetcher } from '../code/utils'
import { Box, Button, ButtonGroup, Stack } from '@mui/material'
import ClickAwayListener from 'react-click-away-listener';
import { useRouter } from 'next/router'
import { useDebouncedCallback } from 'use-debounce'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import { set } from 'lodash'

const AnnotationContext = createContext()

export const useAnnotation = () => useContext(AnnotationContext)

const AnnotationState = {
  "NOT_ANNOTATED": {
    "outline": "#000",
    "boxShadow": ""
  },
  "ANNOTATED": {
    "outline": "#00f",
    "boxShadow": "0 0 2px 6px #fff, 0 0 5px 5px #00f"
  }
}

const EditingState = {
  "HOVER": {
    "boxShadow": "0 0 2px 6px #fff, 0 0 5px 5px #555"
  },
  "ACTIVE": {
    "boxShadow": "0 0 2px 6px #fff, 0 0 5px 5px #0f0"
  },
}


const AnnotateToolbar = ({ readOnly, state, onDiscard }) => {

  const [ discardDialogOpen, setDiscardDialogOpen ] = useState(false)

  return (
    <>
      { state === "ANNOTATED" && !readOnly && (
            <Button
              variant={"text"}
              size={"small"}
              onClick={(ev) => {
                ev.stopPropagation()
                setDiscardDialogOpen(true)
              }}
            >
              Discard
            </Button>
          )
      }
    <DialogFeedback
      open={discardDialogOpen}
      title={"Discard Annotation"}
      content={
        "Are you sure you want to discard this annotation?"
      }
      onConfirm={() => {
        onDiscard()
        setDiscardDialogOpen(false)
      }}
      onCancel={() => setDiscardDialogOpen(false)}
    />
    </>
  )
}

const createAnnotation = async (groupScope, student, question, entityType, entity, annotation) => {
  const response = await fetch(`/api/${groupScope}/gradings/annotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      student,
      question,
      entityType,
      entity,
      annotation,
    }),
  });
  const data = await response.json();
  return data;
}

const updateAnnotation = async (groupScope, annotation) => {
  const response = await fetch(`/api/${groupScope}/gradings/annotations/${annotation.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      annotation,
    }),
  })

  const data = await response.json()
  return data
}

const discardAnnotation = async (groupScope, annotationId) => {
  if (annotationId) {
    await fetch(`/api/${groupScope}/gradings/annotations/${annotationId}`, {
      method: 'DELETE',
    })
  }
}

export const AnnotationProvider = ({ children, readOnly = false, student, question, entityType, entity  }) => {

  const router = useRouter()

  const { groupScope } = router.query

  const { data: initial, mutate } = useSWR(
    `/api/${groupScope}/gradings/annotations?entityType=${entityType}&entityId=${entity.id}`,
    fetcher
  )

  const [ annotation, setAnnotation ] = useState(null)
  const [ state, setState ] = useState(stateBasedOnAnnotation(initial))
  
  useEffect(() => {
    setAnnotation(initial)
    setState(stateBasedOnAnnotation(initial))
  }, [initial])

  const change = useCallback(async (content) => {
    if(readOnly){
      return
    }
    const updated = {
      ...annotation,
      content,
    }
    setAnnotation(updated)
    if (state === "NOT_ANNOTATED") {
      setState("ANNOTATED")
    }

    if (annotation?.id) {
      debouncedUpdateAnnotation(groupScope, updated)
    } else {
      const newAnnotation = await createAnnotation(groupScope, student, question, entityType, entity, updated)
      setAnnotation({
        ...updated,
        id: newAnnotation.id
      })
    }
  }, [groupScope, entityType, entity, annotation, student, question, state, mutate, readOnly])

  const debouncedUpdateAnnotation = useDebouncedCallback(updateAnnotation, 1000)

  const discard = useCallback(async () => {
    if(readOnly){
      return
    }
    const annotationId = annotation.id
    setAnnotation(null)
    setState("NOT_ANNOTATED")
    await discardAnnotation(groupScope, annotationId)
  }, [groupScope, annotation, mutate, readOnly])


  return (
    <AnnotationContext.Provider
      value={{
        readOnly,
        annotation,
        change,
      }}
    >
      <AnnotationHighlight readOnly={readOnly} state={state}>
        <Box position={"absolute"} top={0} right={0} zIndex={1000}>
          <AnnotateToolbar 
            readOnly={readOnly}
            state={state}
            onDiscard={() => discard(groupScope, annotation)}
          /> 
        </Box>
      {children}
      </AnnotationHighlight>
    </AnnotationContext.Provider>
  )
}

const AnnotationHighlight = ({ readOnly, state, children }) => {
  const [ editingState, setEditingState ] = useState("INACTIVE")

  const onMouseEnter = useCallback(() => {
    if(readOnly){
      return
    }
    if (editingState !== "ACTIVE" && state !== "ANNOTATED") {
      setEditingState("HOVER");
      
    }
  }, [editingState, state, readOnly]);

  const onMouseLeave = useCallback(() => {
    if(readOnly){
      return
    }
    if (editingState !== "ACTIVE") {
      setEditingState("INACTIVE");
    }
  }, [editingState, readOnly]);
  
  const onClickHandler = useCallback(() => {
    if(readOnly){
      return
    }
    setEditingState("ACTIVE");
  }, [readOnly]);

  return (
    <ClickAwayListener onClickAway={() => {
      setEditingState("INACTIVE")
    }}>
    <Box
      position={"relative"}
      m={2}
      borderRadius={1}    
      backgroundColor={'white'} 
      transition={'box-shadow 0.15s ease-in-out'}
      cursor={'pointer'}
      boxShadow={getBoxShadow(editingState, state)}
      
      onMouseEnter={() => onMouseEnter()}
      onMouseLeave={() => onMouseLeave()}
      onClick={() => onClickHandler()}
    >
      {children}
    </Box>
    </ClickAwayListener>
  )
}

const stateBasedOnAnnotation = (annotation) => {
  return annotation ? "ANNOTATED" : "NOT_ANNOTATED"
}

const getBoxShadow = (editingState, annotationState) => {
  console
  return EditingState[editingState]?.boxShadow || AnnotationState[annotationState]?.boxShadow
}


