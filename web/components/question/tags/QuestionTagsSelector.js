import { useTags } from '../../../context/TagContext'
import { useCallback } from 'react'
import useSWR from 'swr'
import TagsSelector from '../../input/TagsSelector'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'

const QuestionTagsSelector = ({ questionId, onChange }) => {
  const { tags: allTags, upsert } = useTags()

  const {
    data: tags,
    mutate,
    error,
  } = useSWR(`/api/questions/${questionId}/tags`, questionId ? fetcher : null, {
    fallbackData: [],
  })

  const onTagsChange = useCallback(
    async (newTags) => {
      await upsert(questionId, newTags)
      await mutate(newTags)
      onChange && onChange(newTags)
    },
    [questionId, mutate, upsert, onChange]
  )

  return (
    <Loading loading={!tags} errors={[error]}>
      <TagsSelector
        options={allTags.map((tag) => tag.label)}
        value={tags.map((tag) => tag.label)}
        onChange={onTagsChange}
      />
    </Loading>
  )
}

export default QuestionTagsSelector
