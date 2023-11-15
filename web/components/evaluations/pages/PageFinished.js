
import Image from 'next/image'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Stack, Divider, Typography, Button, Tab, IconButton, Tooltip} from '@mui/material'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { Role } from '@prisma/client'

import { fetcher } from '@/code/utils'

import BackButton from '@/components/layout/BackButton'
import LayoutMain from '@/components/layout/LayoutMain'
import DataGrid from '@/components/ui/DataGrid'
import UserAvatar from '@/components/layout/UserAvatar'
import PiePercent from '@/components/feedback/PiePercent'
import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'

import PhaseRedirect from './PhaseRedirect'

import { getObtainedPoints, getSignedSuccessRate } from '../analytics/stats'
import EvaluationAnalytics from '../analytics/EvaluationAnalytics'
import JoinClipboard from '../JoinClipboard'


const PageFinished = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { data: evaluation, error: errorEvaluation } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
      groupScope && evaluationId ? fetcher : null
  )

  const { data, error: errorQuestions } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/questions?withGradings=true`,
      groupScope && evaluationId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [tab, setTab] = useState(1)
  const [evaluationToQuestions, setEvaluationToQuestions] =
    useState([])
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    if (data) {
      setEvaluationToQuestions(data)
    }
  }, [data])

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      setParticipants(
        evaluationToQuestions[0].question.studentAnswer
          .map((sa) => sa.user)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    }
  }, [evaluationToQuestions])

  const gridHeaders = () => {
    let q = evaluationToQuestions.map((jstq) => ({
      label: <b>{`Q${jstq.order + 1}`}</b>,
      tooltip: jstq.question.title,
      column: { width: '30px', align: 'center' },
    }))

    return {
      columns: [
        {
          label: 'Participant',
          column: { flexGrow: 1 },
        },
        {
          label: 'Actions',
          column: { width: '80px' },
        },
        {
          label: 'Success',
          column: { width: '80px' },
        },
        ...q,
      ],
    }
  }

  const gridRows = () =>
    participants.map((participant) => {
      let obtainedPoints = getObtainedPoints(evaluationToQuestions, participant)
      let totalPoints = evaluationToQuestions.reduce(
        (acc, jstq) => acc + jstq.points,
        0
      )
      let participantSuccessRate =
        totalPoints > 0 ? Math.round((obtainedPoints / totalPoints) * 100) : 0

      const questionColumnValues = {}

      evaluationToQuestions.forEach((jstq) => {
        const grading = jstq.question.studentAnswer.find(
          (sa) => sa.user.email === participant.email
        ).studentGrading
        let pointsObtained = grading ? grading.pointsObtained : 0
        let totalPoints = jstq.points
        let successRate =
          totalPoints > 0 ? Math.round((pointsObtained / totalPoints) * 100) : 0

        let color =
          successRate > 70 ? 'success' : successRate > 40 ? 'info' : 'error'
        questionColumnValues[`Q${jstq.order + 1}`] = (
          <Stack display="inline-flex" alignItems="center" justifyContent="center" spacing={0.1}>
            <Typography variant="body2" sx={{ color: `${color}.main` }}>{`${pointsObtained}`}</Typography>
            <Divider sx={{ width:"100%" }} />
            <Typography variant="body2" sx={{ color: `${color}.main` }}>{`${totalPoints}`}</Typography>
          </Stack>
        )
      })

      return {
        participant: <UserAvatar user={participant} />,
        actions: (
          <Tooltip title="View student's answers" key="view-student-answers">
            <a href={`/${groupScope}/evaluations/${evaluationId}/consult/${participant.email}/1`} target="_blank">
              <IconButton size="small">
                <Image
                  alt="View"
                  src="/svg/icons/view-user.svg"
                  layout="fixed"
                  width="18"
                  height="18"
                />

              </IconButton>
            </a>
          </Tooltip>
        ),
        successRate: (
          <PiePercent
            size={60}
            value={participantSuccessRate}
            label={
              <Stack alignItems="center" justifyContent="center" spacing={0}>
                <Typography variant="body2">{`${obtainedPoints}`}</Typography>
                <Divider sx={{ width: '100%' }} />
                <Typography variant="caption">{`${totalPoints}`}</Typography>
              </Stack>
            }
          />
        ),
        ...questionColumnValues,
        meta: {
          key: participant.email,
          linkHref: `/${groupScope}/evaluations/${evaluationId}/consult/${participant.email}/1`,
        },
      }
    })

  const dotToComma = (value) => value.toString().replace('.', ',');

  const exportAsCSV = () => {
    let COLUMN_SEPARATOR = ';'
    let LINE_SEPARATOR = '\r'

    let csv = `Name${COLUMN_SEPARATOR}Email${COLUMN_SEPARATOR}Success Rate${COLUMN_SEPARATOR}Total Points${COLUMN_SEPARATOR}Obtained Points${COLUMN_SEPARATOR}`
    evaluationToQuestions.forEach(
      (jstq) => (csv += `Q${jstq.order + 1}${COLUMN_SEPARATOR}`)
    )
    csv += LINE_SEPARATOR

    participants.forEach((participant) => {
      let obtainedPoints = getObtainedPoints(evaluationToQuestions, participant)

      let totalPoints = evaluationToQuestions.reduce(
        (acc, jstq) => acc + jstq.points,
        0
      )
      let participantSuccessRate =
        totalPoints > 0 ? Math.round((obtainedPoints / totalPoints) * 100) : 0

      csv += `${participant.name}${COLUMN_SEPARATOR}${participant.email}${COLUMN_SEPARATOR}${`${participantSuccessRate} %`}${COLUMN_SEPARATOR}${dotToComma(totalPoints)}${COLUMN_SEPARATOR}${dotToComma(obtainedPoints)}${COLUMN_SEPARATOR}`

      evaluationToQuestions.forEach((jstq) => {
        const grading = jstq.question.studentAnswer.find(
          (sa) => sa.user.email === participant.email
        ).studentGrading
        let pointsObtained = grading ? grading.pointsObtained : 0
        csv += `"${dotToComma(pointsObtained)}"${COLUMN_SEPARATOR}`
      })

      csv += LINE_SEPARATOR
    })

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    let url = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.setAttribute('href', url)

    let sessionLabel = evaluation.label.replace(/ /g, '_').toLowerCase()

    link.setAttribute(
      'download',
      `evaluation-${evaluation.id}-${sessionLabel}-results.csv`
    )
    link.click()
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <PhaseRedirect phase={evaluation?.phase}>
        <Loading
          errors={[errorEvaluation, errorQuestions]}
          loading={!evaluation || !evaluationToQuestions}
        >
          <TabContext value={tab}>
            {evaluationToQuestions && evaluationToQuestions.length > 0 && (
              <LayoutMain
                hideLogo
                header={
                  <Stack direction="row" alignItems="center">
                    <BackButton backUrl={`/${groupScope}/evaluations`} />
                    { evaluation?.id && (
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {evaluation.label}
                      </Typography>
                    )}
                  </Stack>
                }
                subheader={
                  <TabList onChange={handleTabChange}>
                    <Tab label="Results" value={1} />
                    <Tab label="Analytics" value={2} />
                  </TabList>
                }
                padding={2}
                spacing={2}
              >
                <TabPanel value={1}>
                  <Stack spacing={4}>
                    <JoinClipboard evaluationId={evaluationId} />

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6">
                          Overall success rate
                        </Typography>
                        <PiePercent
                          value={getSignedSuccessRate(evaluationToQuestions)}
                        />
                      </Stack>
                      <Button onClick={exportAsCSV}>Export as csv</Button>
                    </Stack>

                    <DataGrid header={gridHeaders()} items={gridRows()} />
                  </Stack>
                </TabPanel>
                <TabPanel value={2}>
                  <EvaluationAnalytics
                    showSuccessRate
                    evaluationToQuestions={evaluationToQuestions}
                  />
                </TabPanel>
              </LayoutMain>
            )}
          </TabContext>
        </Loading>
      </PhaseRedirect>
    </Authorisation>
  )
}

export default PageFinished
