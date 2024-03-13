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
import { Chip } from '@mui/material'
import { EvaluationPhase } from '@prisma/client'
const DisplayPhase = ({ phase }) => {
  switch (phase) {
    case EvaluationPhase.DRAFT:
      return <Chip label="Draft" color="warning" />
    case EvaluationPhase.IN_PROGRESS:
      return <Chip label="In progress" color="info" />
    case EvaluationPhase.GRADING:
      return <Chip label="Grading" color="primary" />
    case EvaluationPhase.FINISHED:
      return <Chip label="Finished" color="success" />
    default:
      return <Chip label="N/A" color="error" />
  }
}

export default DisplayPhase
