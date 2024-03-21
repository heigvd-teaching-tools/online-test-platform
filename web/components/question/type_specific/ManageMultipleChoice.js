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
import useSWR from 'swr'
import { useCallback } from 'react'
import MultipleChoice from './MultipleChoice'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'

const ManageMultipleChoice = ({ groupScope, questionId, onUpdate }) => {
  const {
    data: options,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  const onChangeOptions = useCallback(
    async (index, options) => {
      const updatedOption = options[index]
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            option: updatedOption,
          }),
        },
      )
        .then(async (res) => {
          if (res.status === 200) {
            await mutate(options)
          }
        })
        .finally(() => {
          onUpdate && onUpdate()
        })
    },
    [groupScope, questionId, mutate, onUpdate],
  )

  const onDeleteOption = useCallback(
    async (_, deletedOption) => {
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            option: deletedOption,
          }),
        },
      )
        .then(async (res) => {
          if (res.status === 200) {
            await mutate()
          }
        })
        .finally(() => {
          onUpdate && onUpdate()
        })
    },
    [groupScope, questionId, mutate, onUpdate],
  )

  const onAddOption = useCallback(async () => {
    await fetch(
      `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          option: { text: '', isCorrect: false },
        }),
      },
    )
      .then(async (res) => {
        if (res.status === 200) {
          await mutate()
        }
      })
      .finally(() => {
        onUpdate && onUpdate()
      })
  }, [groupScope, questionId, mutate, onUpdate])

  return (
    <Loading loading={!options} errors={[error]}>
      <MultipleChoice
        options={options}
        onAdd={onAddOption}
        onChange={async (changedIndex, newOptions) => {
          await onChangeOptions(changedIndex, newOptions)
        }}
        onDelete={async (deletedIndex, deletedOption) => {
          await onDeleteOption(deletedIndex, deletedOption)
        }}
      />
    </Loading>
  )
}

export default ManageMultipleChoice
