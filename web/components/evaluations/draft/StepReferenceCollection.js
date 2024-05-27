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
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  Stack,
  TextField,
  Autocomplete,
  Typography,
  AlertTitle,
} from '@mui/material'

import AlertFeedback from '@/components/feedback/AlertFeedback'
import { fetcher } from '@/code/utils'
import Loading from '@/components/feedback/Loading'

const StepReferenceCollection = ({
  groupScope,
  disabled,
  evaluation,
  onChangeCollection,
  onLoadQuestions,
}) => {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [input, setInput] = useState('')

  const { data: collections, error: errorCollection } = useSWR(
    `/api/${groupScope}/collections`,
    groupScope && fetcher,
  )

  const { data: evaluationQuestions, error: errorsEvaluationQuestions } =
    useSWR(
      `/api/${groupScope}/evaluations/${evaluation && evaluation.id}/questions`,
      evaluation && evaluation.id && groupScope ? fetcher : null,
    )

  const { data: collectionQuestions, error: errorCollectionQuestions } = useSWR(
    `/api/${groupScope}/collections/${
      selectedCollection && selectedCollection.id
    }/questions`,
    groupScope && selectedCollection ? fetcher : null,
  )

  useEffect(() => {
    if (evaluationQuestions) {
      onLoadQuestions(evaluationQuestions)
    }
  }, [evaluationQuestions, onLoadQuestions])

  useEffect(() => {
    if (selectedCollection) {
      onChangeCollection(selectedCollection)
    }
  }, [selectedCollection, onChangeCollection])
  const hasQuestions = () =>
    (evaluationQuestions && evaluationQuestions.length > 0) ||
    (collectionQuestions && collectionQuestions.length > 0)

  return (
    <Loading
      loading={!collections}
      errors={[
        errorCollection,
        errorsEvaluationQuestions,
        errorCollectionQuestions,
      ]}
    >
      <Stack spacing={2}>
        {!evaluationQuestions && (
          <>
            <Typography variant="h6">Reference Collection</Typography>

            <Autocomplete
              id="collection-id"
              inputValue={input}
              options={collections || []}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Find the reference collection"
                  error={!hasQuestions()}
                  helperText={
                    !hasQuestions() && 'Please select the reference collections'
                  }
                />
              )}
              noOptionsText="No collections found"
              onInputChange={(event, newInputValue) => {
                setInput(newInputValue)
              }}
              onChange={(_, collection) => {
                setSelectedCollection(collection)
              }}
            />
          </>
        )}

        {selectedCollection && (
          <AlertFeedback severity="info">
            <AlertTitle>
              The reference collection contains{' '}
              {selectedCollection.collectionToQuestions.length} questions.
            </AlertTitle>
            <Typography variant="body1">
              Upon saving, a <b>copy</b> of each question will be added to this
              evaluation. Any changes made to the reference collection or its
              questions will not affect this evaluation.
            </Typography>
          </AlertFeedback>
        )}

        {evaluationQuestions &&
          selectedCollection &&
          evaluationQuestions.length > 0 && (
            <AlertFeedback severity="warning">
              This evaluation already has {evaluationQuestions.length}{' '}
              questions. They will be replaced by the questions of the reference
              collection.
            </AlertFeedback>
          )}

        {evaluationQuestions && evaluationQuestions.length > 0 && (
          <AlertFeedback severity="success">
            This evaluation contains {evaluationQuestions.length} questions.
          </AlertFeedback>
        )}
      </Stack>
    </Loading>
  )
}

export default StepReferenceCollection
