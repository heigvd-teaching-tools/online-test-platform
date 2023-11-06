import {
  QuestionType,
  StudentAnswerStatus,
  StudentQuestionGradingStatus,
} from '@prisma/client'

export const getSignedSuccessRate = (jamSessionToQuestions) => {
  // total signed points
  let totalSignedPoints = jamSessionToQuestions.reduce((acc, jstq) => {
    let signedGradings = jstq.question.studentAnswer.filter(
      (sa) => sa.studentGrading.signedBy
    ).length
    return acc + signedGradings * jstq.points
  }, 0)
  // total signed obtained points
  let totalSignedObtainedPoints = jamSessionToQuestions.reduce(
    (acc, jstq) =>
      acc +
      jstq.question.studentAnswer
        .filter((sa) => sa.studentGrading.signedBy)
        .reduce((acc, sa) => acc + sa.studentGrading.pointsObtained, 0),
    0
  )
  return totalSignedPoints > 0
    ? Math.round((totalSignedObtainedPoints / totalSignedPoints) * 100)
    : 0
}

export const getObtainedPoints = (jamSessionToQuestions, participant) =>
  jamSessionToQuestions.reduce((acc, { question }) => {
    let studentGrading = question.studentAnswer.find(
      (sa) => sa.user.id === participant.id
    ).studentGrading
    return acc + (studentGrading ? studentGrading.pointsObtained : 0)
  }, 0)

export const getGradingStats = (jamSessionToQuestions) => {
  let totalGradings = jamSessionToQuestions.reduce(
    (acc, jstq) => acc + jstq.question.studentAnswer.length,
    0
  )
  let totalSigned = jamSessionToQuestions.reduce(
    (acc, jstq) =>
      acc +
      jstq.question.studentAnswer.filter((sa) => sa.studentGrading.signedBy)
        .length,
    0
  )
  let totalAutogradedUnsigned = jamSessionToQuestions.reduce(
    (acc, jstq) =>
      acc +
      jstq.question.studentAnswer.filter(
        (sa) =>
          sa.studentGrading.status ===
            StudentQuestionGradingStatus.AUTOGRADED &&
          !sa.studentGrading.signedBy
      ).length,
    0
  )

  return {
    totalGradings,
    totalSigned,
    totalAutogradedUnsigned,
  }
}

export const getQuestionSuccessRate = (jamSessionToQuestions) => {
  const { question } = jamSessionToQuestions
  let totalPoints = jamSessionToQuestions.points * question.studentAnswer.length
  let totalObtainedPoints = question.studentAnswer.reduce(
    (acc, sa) => acc + sa.studentGrading.pointsObtained,
    0
  )

  return totalPoints > 0
    ? Math.round((totalObtainedPoints / totalPoints) * 100)
    : 0
}

export const typeSpecificStats = (question) => {
  switch (question.type) {
    case QuestionType.multipleChoice:
      return question[question.type].options.map((option, index) => {
        // number of times this option was selected in student answers
        let chosen = question.studentAnswer.reduce((acc, sa) => {
          if (sa.status === StudentAnswerStatus.SUBMITTED) {
            let isChosen = sa[question.type].options.some(
              (o) => o.id === option.id
            )
            if (isChosen) {
              return acc + 1
            }
          }
          return acc
        }, 0)
        return {
          label: `O${index + 1}`,
          tooltip: option.text,
          chosen,
        }
      })
    case QuestionType.trueFalse:
      let trueChosen = question.studentAnswer.reduce((acc, sa) => {
        if (
          sa.status === StudentAnswerStatus.SUBMITTED &&
          sa[question.type].isTrue
        ) {
          return acc + 1
        }
        return acc
      }, 0)
      let falseChosen = question.studentAnswer.reduce((acc, sa) => {
        if (
          sa.status === StudentAnswerStatus.SUBMITTED &&
          !sa[question.type].isTrue
        ) {
          return acc + 1
        }
        return acc
      }, 0)
      return {
        true: {
          chosen: trueChosen,
        },
        false: {
          chosen: falseChosen,
        },
      }
    case QuestionType.code:
      let success = question.studentAnswer.reduce((acc, sa) => {
        // Check if the student's answer has been submitted, test cases have been run, and all test cases passed.
        if (
          sa.status === StudentAnswerStatus.SUBMITTED &&
          sa[question.type]?.testCaseResults?.length > 0 &&
          sa[question.type].allTestCasesPassed
        ) {
          return acc + 1;
        }
        return acc;
      }, 0);

      let failure = question.studentAnswer.reduce((acc, sa) => {
        // Check if the student's answer has been submitted, test cases have been run, and not all test cases passed.
        if (
          sa.status === StudentAnswerStatus.SUBMITTED &&
          sa[question.type]?.testCaseResults?.length > 0 &&
          !sa[question.type].allTestCasesPassed
        ) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return {
        success: {
          count: success,
        },
        failure: {
          count: failure,
        },
      };
    case QuestionType.essay:
    case QuestionType.web:
      let submitted = question.studentAnswer.reduce((acc, sa) => {
        if (sa.status === StudentAnswerStatus.SUBMITTED) {
          return acc + 1
        }
        return acc
      }, 0)
      let missing = question.studentAnswer.reduce((acc, sa) => {
        if (sa.status === StudentAnswerStatus.MISSING) {
          return acc + 1
        }
        return acc
      }, 0)
      return {
        submitted: {
          count: submitted,
        },
        missing: {
          count: missing,
        },
      }
      case QuestionType.database:
        
        const testQueries = question.database.solutionQueries.filter((sq) => sq.query.testQuery)
        const lintQueries = question.database.solutionQueries.filter((sq) => sq.query.lintRules)

        const testQueriesStats = []
        const lintQueriesStats = []


        for(const testQuery of testQueries) {
          const testSuccesses =  question.studentAnswer.reduce((acc, sa) => {           
            const studentQuery = sa.database.queries.find((saQ) => saQ.query.order === testQuery.query.order);
            if(studentQuery.studentOutput?.output.testPassed) {
              return acc + 1
            }
            return acc
            
          }, 0);

          const testFailures =  question.studentAnswer.reduce((acc, sa) => {
            const studentQuery = sa.database.queries.find((saQ) => saQ.query.order === testQuery.query.order);
            if(!studentQuery.studentOutput?.output.testPassed) {
              return acc + 1
            }
            return acc
          }, 0);

          testQueriesStats.push({
            order: testQuery.query.order,
            title: testQuery.query.title,
            testSuccesses,
            testFailures,
          })
        }

        for(const lintQuery of lintQueries) {
          const lintSuccesses =  question.studentAnswer.reduce((acc, sa) => {
            const studentQuery = sa.database.queries.find((saQ) => saQ.query.order === lintQuery.query.order);
            if(studentQuery.query.lintResult?.violations.length === 0) {
              return acc + 1
            }
            return acc
          }, 0);

          const lintFailures =  question.studentAnswer.reduce((acc, sa) => {
            const studentQuery = sa.database.queries.find((saQ) => saQ.query.order === lintQuery.query.order);
            if(!studentQuery.query.lintResult || studentQuery.query.lintResult?.violations.length > 0) {
              return acc + 1
            }
            return acc
          }, 0);

          lintQueriesStats.push({
            order: lintQuery.query.order,
            title: lintQuery.query.title,
            lintSuccesses,
            lintFailures,
          })
        }

      return {
        testQueriesStats,
        lintQueriesStats,
      }
    default:
      return null
  }
}
