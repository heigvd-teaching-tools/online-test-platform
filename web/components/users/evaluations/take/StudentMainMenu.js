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
import { Box, Stack, Tab, Tabs } from '@mui/material'
import ConnectionIndicator from './ConnectionIndicator'
import EvaluationCountDown from '@/components/evaluations/in-progress/EvaluationCountDown'
import Paging from '@/components/layout/utils/Paging'
import { useRouter } from 'next/router'

const HomeSvgIcon = () => (
  <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
    <g transform="translate(0, 0)">
      <path
        d="M6,14H2V2H12V5.5L14,7V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V15a1,1,0,0,0,1,1H6Z"
        fill="#2196f3"
      ></path>
      <polygon
        points="12 8 8 11 8 16 11 16 11 13 13.035 13 13.035 16 16 16 16 11 12 8"
        fill="#2196f3"
        data-color="color-2"
      ></polygon>
      <rect x="4" y="4" width="6" height="1" fill="#2196f3"></rect>
      <rect x="4" y="7" width="6" height="1" fill="#2196f3"></rect>
      <rect x="4" y="10" width="3" height="1" fill="#2196f3"></rect>
    </g>
  </svg>
)

const StudentMainMenu = ({ evaluationId, evaluation, pages = [], page }) => {
  const router = useRouter()

  return (
    <Stack direction="row" alignItems="center">
      <ConnectionIndicator />
      {evaluation.startAt && evaluation.endAt && (
        <Box sx={{ ml: 2 }}>
          <EvaluationCountDown
            startDate={evaluation.startAt}
            endDate={evaluation.endAt}
          />
        </Box>
      )}
      <Stack>
        <Tabs value={page}>
          <Tab
            label="Home"
            iconPosition="start"
            sx={{ minHeight: '50px', minWidth: 0, mb: 1, mt: 1 }}
            value={0}
            icon={
              <Box mr={1}>
                <HomeSvgIcon />
              </Box>
            }
            onClick={() =>
              router.push(`/users/evaluations/${evaluationId}/take/0`)
            }
          />
        </Tabs>
      </Stack>
      <Stack direction="row" flex={1} overflow={'auto'}>
        {pages.length > 0 && (
          <Paging
            items={pages}
            active={pages[page - 1]}
            link={(_, index) =>
              `/users/evaluations/${evaluationId}/take/${index + 1}`
            }
          />
        )}
      </Stack>
    </Stack>
  )
}

export default StudentMainMenu
