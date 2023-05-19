import { useState, useEffect } from 'react'
import { StudentQuestionGradingStatus } from '@prisma/client'
import Image from 'next/image'
import { Box, Paper, Stack, TextField, InputAdornment } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import GradingStatus from './GradingStatus'

import { useSession } from 'next-auth/react'
import GradingSigned from './GradingSigned'
import GradingPointsComment from './GradingPointsComment'

const GradingSignOff = ({
  loading,
  grading: initial,
  maxPoints,
  onSignOff,
}) => {
  const [grading, setGrading] = useState(initial)
  const { data } = useSession()

  useEffect(() => {
    setGrading(initial)
  }, [initial])

  const signOffGrading = () => {
    let status = grading.status
    switch (grading.status) {
      case StudentQuestionGradingStatus.UNGRADED:
        status = StudentQuestionGradingStatus.GRADED
        break
      case StudentQuestionGradingStatus.AUTOGRADED:
        if (grading.pointsObtained !== initial.pointsObtained) {
          status = StudentQuestionGradingStatus.GRADED
        }
        break
      default:
        break
    }

    let newGrading = {
      ...grading,
      isCorrect: grading.pointsObtained === maxPoints,
      status: status,
      signedBy: data.user,
    }
    setGrading(newGrading)
    onSignOff(newGrading)
  }

  const unsignGrading = () => {
    let newGrading = {
      ...grading,
      status:
        grading.status === StudentQuestionGradingStatus.GRADED
          ? StudentQuestionGradingStatus.UNGRADED
          : grading.status,
      signedBy: undefined,
    }
    setGrading(newGrading)
    onSignOff(newGrading)
  }

  return (
    <Paper
      sx={{
        flex: 1,
      }}
      square
    >
      {grading && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: '100%', p: 2 }}
          spacing={2}
        >
          <Stack direction="row">
            {grading.signedBy ? (
              <GradingSigned
                signedBy={grading.signedBy}
                grading={grading}
                onUnsign={unsignGrading}
              />
            ) : (
              <LoadingButton
                color="success"
                variant="contained"
                loading={loading}
                loadingPosition="start"
                startIcon={
                  <Image
                    src="/svg/grading/sign-off.svg"
                    alt="Sign Off"
                    layout="fixed"
                    width={16}
                    height={16}
                  />
                }
                onClick={signOffGrading}
              >
                Sign Off
              </LoadingButton>
            )}
          </Stack>

          {!grading.signedBy && (
            <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
              <Box>
                <TextField
                  label="Pts"
                  id="filled-points"
                  type="number"
                  variant="filled"
                  value={grading.pointsObtained}
                  InputProps={{
                    sx: { pr: 2 },
                    inputProps: {
                      min: 0,
                      max: maxPoints,
                      sx: { minWidth: 30 },
                    },
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mt: 2.2 }}>
                        / {maxPoints}
                      </InputAdornment>
                    ),
                  }}
                  onChange={(event) => {
                    let points = parseInt(event.target.value)
                    if (points > maxPoints) {
                      points = maxPoints
                    }
                    if (points < 0) {
                      points = 0
                    }
                    let newGrading = {
                      ...grading,
                      pointsObtained: points,
                    }
                    setGrading(newGrading)
                  }}
                />
              </Box>
              <TextField
                label="Comment"
                fullWidth
                multiline
                variant="filled"
                value={grading.comment || ''}
                onChange={(event) => {
                  let newGrading = {
                    ...grading,
                    comment: event.target.value,
                  }
                  setGrading(newGrading)
                }}
              />
            </Stack>
          )}
          {grading.signedBy && (
            <GradingPointsComment
              points={grading.pointsObtained}
              maxPoints={maxPoints}
              comment={grading.comment}
            />
          )}

          <GradingStatus grading={grading} maxPoints={maxPoints} />
        </Stack>
      )}
    </Paper>
  )
}

export default GradingSignOff
