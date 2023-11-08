import { useRouter } from 'next/router'

import { Box } from '@mui/material'

import LayoutMain from '../../layout/LayoutMain'

import { Role } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import QuestionUpdate from '../../question/QuestionUpdate'

import BackButton from '../../layout/BackButton'

const PageUpdate = () => {
    const router = useRouter()
    const { groupScope } = router.query;
    return (
        <Authorisation allowRoles={[Role.PROFESSOR]}>
          <LayoutMain
            hideLogo
            header={
              <BackButton backUrl={`/${groupScope}/questions`} />
            }
          >
            <Box width="100%" height="100%" pt={1}>
              <QuestionUpdate
                  groupScope={router.query.groupScope}
                  questionId={router.query.questionId}
              />
            </Box>
          </LayoutMain>
        </Authorisation>
    )
}

export default PageUpdate
