import { Box, Grow, Paper, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { getQuestionSuccessRate, typeSpecificStats } from './stats'
import { QuestionType, StudentAnswerStatus } from '@prisma/client'

import PiePercent from '../../feedback/PiePercent'
import QuestionTypeIcon from '../../question/QuestionTypeIcon'

const JamSessionAnalytics = ({ JamSessionToQuestions }) => {
  return (
    <Stack spacing={8} alignItems="center" sx={{ width: '100%' }}>
      {JamSessionToQuestions.map((jstq, index) => (
        <QuestionAnalytics key={index} JamSessionToQuestion={jstq} />
      ))}
    </Stack>
  )
}

const QuestionAnalytics = ({ JamSessionToQuestion }) => {
  const { question } = JamSessionToQuestion
  const [questionData, setQuestionData] = useState(null)
  useEffect(() => {
    if (JamSessionToQuestion) {
      let data = {
        label: `Q${JamSessionToQuestion.order + 1}`,
        type: question.type,
        [question.type]: typeSpecificStats(question),
      }
      switch (question.type) {
        case QuestionType.multipleChoice: {
          let maxValue = Math.max(
            ...data[question.type].map((option) => option.chosen)
          )
          data[question.type] = data[question.type].map((option) => ({
            ...option,
            percentage:
              maxValue > 0 ? Math.round((option.chosen / maxValue) * 100) : 0,
          }))
          break
        }
        case QuestionType.trueFalse: {
          let maxValue = Math.max(
            data[question.type].true.chosen,
            data[question.type].false.chosen
          )
          data[question.type].true.percentage =
            maxValue > 0
              ? Math.round((data[question.type].true.chosen / maxValue) * 100)
              : 0
          data[question.type].false.percentage =
            maxValue > 0
              ? Math.round((data[question.type].false.chosen / maxValue) * 100)
              : 0
          break
        }
        case QuestionType.code: {
          let maxValue = Math.max(
            data[question.type].success.count,
            data[question.type].failure.count
          )
          data[question.type].success.percentage =
            maxValue > 0
              ? Math.round((data[question.type].success.count / maxValue) * 100)
              : 0
          data[question.type].failure.percentage =
            maxValue > 0
              ? Math.round((data[question.type].failure.count / maxValue) * 100)
              : 0
          break
        }
        case QuestionType.essay:
        case QuestionType.web: {
          let maxValue = Math.max(
            data[question.type].submitted.count,
            data[question.type].missing.count
          )
          data[question.type].submitted.percentage =
            maxValue > 0
              ? Math.round(
                  (data[question.type].submitted.count / maxValue) * 100
                )
              : 0
          data[question.type].missing.percentage =
            maxValue > 0
              ? Math.round((data[question.type].missing.count / maxValue) * 100)
              : 0
          break
        }
        case QuestionType.database: 
        
          data[question.type].testQueriesStats = data[question.type].testQueriesStats.map((testQueryStats) => {
            const testSuccesses =  testQueryStats.testSuccesses;
            const testFailures =  testQueryStats.testFailures;
            return {
              label: `Test Query #${testQueryStats.order} - ${testQueryStats.title}`,
              success: {
                label: "Success",
                percent: testSuccesses + testFailures > 0 ? Math.round((testSuccesses / (testSuccesses + testFailures)) * 100) : 0,
                amount: testSuccesses,
              },
              failure: {
                label: "Failure",
                percent: testSuccesses + testFailures > 0 ? Math.round((testFailures / (testSuccesses + testFailures)) * 100) : 0,
                amount: testFailures,
              }
            }
          });

          data[question.type].lintQueriesStats = data[question.type].lintQueriesStats.map((lintQueryStats) => {
            const lintSuccesses =  lintQueryStats.lintSuccesses;
            const lintFailures =  lintQueryStats.lintFailures;
            return {
              label: `Lint Query #${lintQueryStats.order} - ${lintQueryStats.title}`,
              success: {
                label: "Success",
                percent: lintSuccesses + lintFailures > 0 ? Math.round((lintSuccesses / (lintSuccesses + lintFailures)) * 100) : 0,
                amount: lintSuccesses,
              },
              failure: {
                label: "Failure",
                percent: lintSuccesses + lintFailures > 0 ? Math.round((lintFailures / (lintSuccesses + lintFailures)) * 100) : 0,
                amount: lintFailures,
              }
            }
          });

        break;
        default:
          break
      }
      setQuestionData(data)
    }
  }, [question, JamSessionToQuestion])

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={'space-between'}
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <QuestionTypeIcon type={question.type} withLabel />
            <Typography variant="h6">
              <b>{`Q${JamSessionToQuestion.order + 1}`}</b>
            </Typography>
            <Typography variant="body1">{question.title}</Typography>
          </Stack>
          <Typography variant="body2">
            Submitted Answers :
            {
              question.studentAnswer.filter(
                (sa) => sa.status === StudentAnswerStatus.SUBMITTED
              ).length
            }
            /{question.studentAnswer.length}
          </Typography>
        </Stack>
        {questionData &&
          ((questionData.type === QuestionType.multipleChoice && (
            <Stack direction="column" alignItems="flex-start" spacing={2}>
              {questionData[questionData.type].map((option, index) => (
                <AnalyticsRow
                  key={index}
                  label={option.label}
                  percent={option.percentage}
                  amount={option.chosen}
                />
              ))}
            </Stack>
          )) ||
            (questionData.type === QuestionType.trueFalse && (
              <>
                <AnalyticsRow
                  label="True"
                  percent={questionData[questionData.type].true.percentage}
                  amount={questionData[questionData.type].true.chosen}
                />
                <AnalyticsRow
                  label="False"
                  percent={questionData[questionData.type].false.percentage}
                  amount={questionData[questionData.type].false.chosen}
                />
              </>
            )) ||
            (questionData.type === QuestionType.code && (
              <>
                <AnalyticsRow
                  label="Success"
                  color="success"
                  percent={questionData[questionData.type].success.percentage}
                  amount={questionData[questionData.type].success.count}
                />
                <AnalyticsRow
                  label="Failure"
                  color="error"
                  percent={questionData[questionData.type].failure.percentage}
                  amount={questionData[questionData.type].failure.count}
                />
              </>
            )) ||
            ((questionData.type === QuestionType.essay ||
              questionData.type === QuestionType.web) && (
              <>
                <AnalyticsRow
                  label="Submitted"
                  color="success"
                  percent={questionData[questionData.type].submitted.percentage}
                  amount={questionData[questionData.type].submitted.count}
                />
                <AnalyticsRow
                  label="Missing"
                  color="error"
                  percent={questionData[questionData.type].missing.percentage}
                  amount={questionData[questionData.type].missing.count}
                />
              </>
            )) ||
            (questionData.type === QuestionType.database && (
              <>
                <Stack direction="row" alignItems="flex-start" spacing={2} width={"100%"}>
                  <Stack flex={1} spacing={1}>
                    <Typography variant="h5"> Output tests </Typography>
                    {questionData[questionData.type].testQueriesStats.map((testQueryStats, index) => (
                      <Stack key={index} direction="column" alignItems="flex-start" spacing={1}>
                        <Typography variant="body1"><b>{testQueryStats.label}</b></Typography>
                        <AnalyticsRow
                          label={testQueryStats.success.label}
                          color="success"
                          percent={testQueryStats.success.percent}
                          amount={testQueryStats.success.amount}
                        />
                        <AnalyticsRow
                          label={testQueryStats.failure.label}
                          color="error"
                          percent={testQueryStats.failure.percent}
                          amount={testQueryStats.failure.amount}
                        />
                      </Stack>
                    ))}
                  </Stack>
                  <Stack flex={1} spacing={1}>
                    <Typography variant="h5"> Lint tests </Typography>
                    {questionData[questionData.type].lintQueriesStats.map((lintQueryStats, index) => (
                      <Stack key={index} direction="column" alignItems="flex-start" spacing={1}>
                        <Typography variant="body1"><b>{lintQueryStats.label}</b></Typography>
                        <AnalyticsRow
                          label={lintQueryStats.success.label}
                          color="success"
                          percent={lintQueryStats.success.percent}
                          amount={lintQueryStats.success.amount}
                        />
                        <AnalyticsRow
                          label={lintQueryStats.failure.label}
                          color="error"
                          percent={lintQueryStats.failure.percent}
                          amount={lintQueryStats.failure.amount}
                        />
                        </Stack>
                    ))}
                  </Stack>
                </Stack>

              </>
            ))
            )
            }
        <Stack direction="row" spacing={1} alignItems="center">
          <PiePercent value={getQuestionSuccessRate(JamSessionToQuestion)} />
          <Box>
            <Typography variant="body1">
              <b>Success Rate</b>
            </Typography>
            <Typography variant="caption">
              Based on obtained points after grading
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}


const AnalyticsRow = ({ label, percent, amount, color = 'info' }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
    <Box sx={{ width: 60, maxWidth: 60 }}>
      <Typography variant="body1">{label}</Typography>
    </Box>
    <Stack sx={{ flex: 1 }} direction="row" spacing={2} alignItems="center">
      <LinearPercent percent={percent} thickness={15} color={color} />
      <Box sx={{ minWidth: 35, width: 35 }}>
        <Typography variant="caption" sx={{ textAlign: 'center' }}>
          <b>{amount}</b>
        </Typography>
      </Box>
    </Stack>
  </Stack>
)

const LinearPercent = ({ percent, thickness = 10, color = 'info' }) => (
  <Stack sx={{ flex: 1 }}>
    <Box
      sx={{
        width: '100%',
        height: thickness,
        backgroundColor: 'grey.200',
        borderRadius: thickness,
        overflow: 'hidden',
      }}
    >
      <Grow in={percent > 0} timeout={500} style={{ transformOrigin: '0 0 0' }}>
        <Box
          sx={{
            height: thickness,
            width: `${percent}%`,
            bgcolor: `${color}.main`,
          }}
          color={color}
        />
      </Grow>
    </Box>
  </Stack>
)

export default JamSessionAnalytics
