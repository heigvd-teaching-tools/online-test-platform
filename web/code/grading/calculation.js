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

/* 

* IMPORTANT
    - These functions are used to calculate the score of a question based on the grading policy
    - They are used in both the frontend and the backend
*/
export const calculateGradualCreditPoints = (
  maxPoints,
  correctOptions,
  incorrectOptions,
  selectedCorrectOptions,
  selectedIncorrectOptions,
  threshold,
  negativeMarking,
) => {
  const correctnessRatio =
    selectedCorrectOptions / correctOptions -
    selectedIncorrectOptions / incorrectOptions

  const rawScore = maxPoints * correctnessRatio
  let finalScore = rawScore

  if (correctnessRatio < threshold / 100 && rawScore > 0) {
    finalScore = 0
  }

  if (!negativeMarking) {
    finalScore = Math.max(0, finalScore)
  }

  finalScore = Math.round(finalScore * 100) / 100

  return { finalScore, rawScore, correctnessRatio }
}

export const calculateAllOrNothingPoints = (
  maxPoints,
  correctOptions,
  selectedOptions,
) => {
  const isAllCorrect =
    correctOptions.length === selectedOptions.length &&
    correctOptions.every((opt) =>
      selectedOptions.some((aOpt) => aOpt.id === opt.id),
    )

  const finalScore = isAllCorrect ? maxPoints : 0

  return { finalScore, isCorrect: isAllCorrect }
}
