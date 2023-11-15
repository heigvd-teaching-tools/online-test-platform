import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Stack, TextField, Autocomplete, Typography } from '@mui/material'

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
      groupScope && fetcher
  )

  const { data: evaluationQuestions, error: errorsEvaluationQuestions } =
    useSWR(
      `/api/${groupScope}/evaluation/${evaluation && evaluation.id}/questions`,
      evaluation && evaluation.id && groupScope ? fetcher : null
    )

  const { data: collectionQuestions, error: errorCollectionQuestions } = useSWR(
    `/api/${groupScope}/collections/${selectedCollection && selectedCollection.id}/questions`,
      groupScope && selectedCollection ? fetcher : null
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
      <Stack spacing={2} pt={2}>
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
            The reference collection contains{' '}
            {selectedCollection.collectionToQuestions.length} questions. Their
            copy will be assigned for this evaluation.
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
            This evaluation has {evaluationQuestions.length} questions.
          </AlertFeedback>
        )}
      </Stack>
    </Loading>
  )
}

export default StepReferenceCollection
