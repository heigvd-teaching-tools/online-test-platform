import { useRouter } from 'next/router'

import { Stack, Button, Box } from '@mui/material'

import LayoutMain from '../../layout/LayoutMain'

import { Role } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import QuestionUpdate from '../../question/QuestionUpdate'

import Link from 'next/link'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const PageUpdate = () => {
  const router = useRouter()
  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <LayoutMain
        header={
          <Stack direction="row" alignItems="center">
            <Link href={`/questions`}>
              <Button startIcon={<ArrowBackIosIcon />}>Back</Button>
            </Link>
          </Stack>
        }
      >
        <Box width="100%" height="100%">
          <QuestionUpdate questionId={router.query.questionId} />
        </Box>
      </LayoutMain>
    </Authorisation>
  )
}

export default PageUpdate
