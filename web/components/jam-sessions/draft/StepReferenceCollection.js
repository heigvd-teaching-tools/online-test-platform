import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Stack, TextField, Autocomplete, Typography } from '@mui/material'

import AlertFeedback from '../../feedback/AlertFeedback'
import { fetcher } from '../../../code/utils'
import Loading from '../../feedback/Loading'

const StepReferenceCollection = ({
  groupScope,
  disabled,
  jamSession,
  onChangeCollection,
  onLoadQuestions,
}) => {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [input, setInput] = useState('')

  const { data: collections, error: errorCollection } = useSWR(
    `/api/${groupScope}/collections`,
      groupScope && fetcher
  )

  const { data: jamSessionQuestions, error: errorsJamSessionQuestions } =
    useSWR(
      `/api/${groupScope}/jam-sessions/${jamSession && jamSession.id}/questions`,
      jamSession && jamSession.id && groupScope ? fetcher : null
    )

  const { data: collectionQuestions, error: errorCollectionQuestions } = useSWR(
    `/api/${groupScope}/collections/${selectedCollection && selectedCollection.id}/questions`,
      groupScope && selectedCollection ? fetcher : null
  )

  useEffect(() => {
    if (jamSessionQuestions) {
      onLoadQuestions(jamSessionQuestions)
    }
  }, [jamSessionQuestions, onLoadQuestions])

  useEffect(() => {
    if (selectedCollection) {
      onChangeCollection(selectedCollection)
    }
  }, [selectedCollection, onChangeCollection])
  const hasQuestions = () =>
    (jamSessionQuestions && jamSessionQuestions.length > 0) ||
    (collectionQuestions && collectionQuestions.length > 0)

  return (
    <Loading
      loading={!collections}
      errors={[
        errorCollection,
        errorsJamSessionQuestions,
        errorCollectionQuestions,
      ]}
    >
      <Stack spacing={2} pt={2}>
        {!jamSessionQuestions && (
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
            copy will be assigned for this jam session.
          </AlertFeedback>
        )}

        {jamSessionQuestions &&
          selectedCollection &&
          jamSessionQuestions.length > 0 && (
            <AlertFeedback severity="warning">
              This jam session already has {jamSessionQuestions.length}{' '}
              questions. They will be replaced by the questions of the reference
              jam.
            </AlertFeedback>
          )}

        {jamSessionQuestions && jamSessionQuestions.length > 0 && (
          <AlertFeedback severity="success">
            This jam session has {jamSessionQuestions.length} questions.
          </AlertFeedback>
        )}
      </Stack>
    </Loading>
  )
}

export default StepReferenceCollection
