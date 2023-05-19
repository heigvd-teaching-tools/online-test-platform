import useSWR from 'swr'
import { useCallback } from 'react'
import MultipleChoice from './MultipleChoice'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'

const ManageMultipleChoice = ({ questionId }) => {
  const {
    data: options,
    mutate,
    error,
  } = useSWR(
    `/api/questions/${questionId}/multiple-choice/options`,
    questionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const onChangeOptions = useCallback(
    async (index, options) => {
      console.log('change options')
      const updatedOption = options[index]
      await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          option: updatedOption,
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          await mutate(options)
        }
      })
    },
    [questionId, mutate]
  )

  const onDeleteOption = useCallback(
    async (_, deletedOption) => {
      console.log('delete option')
      await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          option: deletedOption,
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          await mutate()
        }
      })
    },
    [questionId, mutate]
  )

  const onAddOption = useCallback(async () => {
    console.log('add option')
    await fetch(`/api/questions/${questionId}/multiple-choice/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        option: { text: '', isCorrect: false },
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        await mutate()
      }
    })
  }, [questionId, mutate])

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
