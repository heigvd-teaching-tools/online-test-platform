import { useState, useEffect, useCallback } from 'react'
import { StudentQuestionGradingStatus } from '@prisma/client'
import Image from 'next/image'
import { Box, Paper, Stack, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import GradingStatus from './GradingStatus'

import { useSession } from 'next-auth/react'
import GradingSigned from './GradingSigned'
import GradingPointsComment from './GradingPointsComment'
import DecimalInput from '../../input/DecimalInput'

const GradingSignOff = ({
  loading,
  grading: initial,
  maxPoints,
  onChange,
}) => {
  const [grading, setGrading] = useState(initial)
  const { data } = useSession()

  useEffect(() => {
    setGrading(initial)
  }, [initial])

  const signOffGrading = useCallback(() => {
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
    onChange(newGrading)
  }, [grading, initial, maxPoints, onChange, data])

  const unsignGrading = useCallback(() => {
    let newGrading = {
      ...grading,
      status:
        grading.status === StudentQuestionGradingStatus.GRADED
          ? StudentQuestionGradingStatus.UNGRADED
          : grading.status,
      signedBy: undefined,
    }
    setGrading(newGrading)
    onChange(newGrading)
  }, [grading, onChange])

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
          spacing={8}
        >
          <Stack direction="row">
            {grading.signedBy ? (
              <GradingSigned
                signedBy={grading.signedBy}
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
                <DecimalInput
                  label={'Awarded Points'}
                  value={grading.pointsObtained}
                  max={maxPoints}
                  rightAdornement={'/ ' + maxPoints + ' pts'}
                  variant="filled"
                  onChange={async (value) => {
                    const newGrading = {
                      ...grading,
                      pointsObtained: value,
                    }
                    setGrading(newGrading)
                    onChange(newGrading)
                  }}
                />
              </Box>
              <TextField
                label="Comment"
                fullWidth
                multiline
                maxRows={3}
                variant="filled"
                value={grading.comment || ''}
                onChange={(event) => {
                  let newGrading = {
                    ...grading,
                    comment: event.target.value,
                  }
                  setGrading(newGrading)
                  onChange(newGrading)
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
