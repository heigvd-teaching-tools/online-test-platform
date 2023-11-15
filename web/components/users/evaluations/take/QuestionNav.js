import { useRouter } from 'next/router'
import { Stack, Button, Typography } from '@mui/material'

const QuestionNav = ({ evaluationId, page, totalPages }) => {
  const router = useRouter()
  
  const nextPage = () => {
    if (page < totalPages) {
      router.push(`/users/evaluations/${evaluationId}/take/${page + 1}`)
    }
  }
  const previousPage = () => {
    if (page > 1) {
      router.push(`/users/evaluations/${evaluationId}/take/${page - 1}`)
    }
  }
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ p: 1 }}
    >
      <Button color="primary" disabled={page === 1} onClick={previousPage}>
        Previous
      </Button>
      <Typography variant="body1">
        <b>
          {page} / {totalPages}
        </b>
      </Typography>
      <Button color="primary" disabled={page === totalPages} onClick={nextPage}>
        Next
      </Button>
    </Stack>
  )
}

export default QuestionNav
