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
import {
  StudentQuestionGradingStatus,
  QuestionType,
  DatabaseQueryOutputStatus,
} from '@prisma/client'

/*
    This function is used to grade a users answers to a question.
    argument "answers" is the users answers to the question.
    argument "question" is the question to which the users answers is submitted.

    If called with answers = undefined, the function will return the default grading.
    Default grading is generally (pointsObtained = 0, status = AUTOGRADED),

    Grading differs for code questions (pointsObtained = 0, status = UNGRADED) because the grading cannot be determined
    during answers editing (code file editing), the grading of code question is done during the code-check run (see /api/sandbox/[questionId]/users.js).

 */
export const grading = (question, totalPoints, studentAnswer) => {
  switch (question.type) {
    case QuestionType.multipleChoice:
      return gradeMultipleChoice(question, totalPoints, studentAnswer)
    case QuestionType.trueFalse:
      return gradeTrueFalse(question, totalPoints, studentAnswer)
    case QuestionType.essay:
      return gradeEssay(studentAnswer)
    case QuestionType.code:
      // users code submission is graded during users code sandbox run
      return gradeCode(totalPoints, studentAnswer)
    case QuestionType.web:
      return gradeWeb(studentAnswer)
    case QuestionType.database:
      // users database submission is graded during users database sandbox run
      return gradeDatabase(totalPoints, studentAnswer)
    default:
      return undefined
  }
}

/*
  evaluationToQuestion.points,
  evaluationToQuestion.question - for official solution
 */

const defaultGrading = {
  status: StudentQuestionGradingStatus.AUTOGRADED,
  pointsObtained: 0,
}

const gradeDatabase = (totalPoints, studentAnswer) => {
  let grading = defaultGrading

  if (studentAnswer) {
    const studentQueries = studentAnswer.database.queries
    const studentTestQueries = studentQueries.filter(
      (studentQuery) => studentQuery.query.testQuery
    )
    const allQueriesExecuted = studentQueries.every(
      (studentQuery) =>
        studentQuery.studentOutput !== null &&
        studentQuery.studentOutput.status === DatabaseQueryOutputStatus.SUCCESS
    )
    const allTestQueriesPassed = studentTestQueries.every(
      (studentQuery) =>
        studentQuery.studentOutput !== null &&
        studentQuery.studentOutput.status ===
          DatabaseQueryOutputStatus.SUCCESS &&
        studentQuery.studentOutput.output.testPassed
    )
    if (allQueriesExecuted && allTestQueriesPassed) {
      grading = {
        status: StudentQuestionGradingStatus.AUTOGRADED,
        pointsObtained: totalPoints,
      }
    }
  }

  return grading
}
const gradeMultipleChoice = (question, totalPoints, studentAnswer) => {
  let grading = defaultGrading

  if (studentAnswer !== undefined) {
    let correctOptions = question.multipleChoice.options.filter(
      (opt) => opt.isCorrect
    )
    let answerOptions = studentAnswer.options
    let isCorrect =
      correctOptions.length === answerOptions.length &&
      correctOptions.every((opt) =>
        answerOptions.some((aOpt) => aOpt.id === opt.id)
      )
    grading = {
      status: StudentQuestionGradingStatus.AUTOGRADED,
      pointsObtained: isCorrect ? totalPoints : 0,
    }
  }
  return grading
}

const gradeTrueFalse = (question, totalPoints, studentAnswer) => {
  let grading = defaultGrading
  if (studentAnswer !== undefined) {
    let isCorrect = question.trueFalse.isTrue === studentAnswer.isTrue
    grading = {
      ...grading,
      pointsObtained: isCorrect ? totalPoints : 0,
    }
  }
  return grading
}

/*
    code grading call is done during answers submission and code test run
    code test run : /api/sandbox/[questionId]/users
*/
const gradeCode = (totalPoints, response) => {
  let grading = {
    ...defaultGrading,
    status: StudentQuestionGradingStatus.UNGRADED,
  }
  const success = response && response.tests.every((test) => test.passed)
  if (success !== undefined) {
    // response is from the code sandbox run
    grading = {
      status: StudentQuestionGradingStatus.AUTOGRADED,
      pointsObtained: success ? totalPoints : 0,
    }
  }
  return grading
}

const gradeEssay = (answer) => ({
  ...defaultGrading,
  status: answer
    ? StudentQuestionGradingStatus.UNGRADED
    : StudentQuestionGradingStatus.AUTOGRADED,
})

const gradeWeb = (answer) => ({
  ...defaultGrading,
  status: answer
    ? StudentQuestionGradingStatus.UNGRADED
    : StudentQuestionGradingStatus.AUTOGRADED,
})
