import UserHelpPopper from "@/components/feedback/UserHelpPopper"
import GradualPolicyCalculationBreakdown from "@/components/evaluations/grading/policy/GradualPolicyCalculationBreakdown"
import { Typography } from "@mui/material"
import { MultipleChoiceGradingPolicyType } from "@prisma/client"
import { useEffect, useState } from "react"
import AllOrNothingPolicyCalculationBreakdown from "./AllOrNothingCalculationBreakdown"

const gradingPolicyToLabel = {
    [MultipleChoiceGradingPolicyType.GRADUAL_CREDIT]: 'Gradual Credit',
    [MultipleChoiceGradingPolicyType.ALL_OR_NOTHING]: 'All or Nothing',
}

const calculateGradualCreditPoints = (
    maxPoints, 
    correctOptions, 
    incorrectOptions, 
    selectedCorrectOptions, 
    selectedIncorrectOptions, 
    threshold, 
    negativeMarking
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

const extractGradualCreditData = (maxPoints, solution, answer) => {

  const correctOptions = solution.options.filter(
    (option) => option.isCorrect,
  )
  const incorrectOptions = solution.options.filter(
    (option) => !option.isCorrect,
  )

  const selectedCorrectOptions = answer.options.filter(
    (answer) => correctOptions.some((option) => option.id === answer.id),
  )

  const selectedIncorrectOptions = answer.options.filter(
    (answer) => incorrectOptions.some((option) => option.id === answer.id),
  )

  const threshold = solution.gradualCreditConfig.threshold
  const negativeMarking =
    solution.gradualCreditConfig.negativeMarking

  const { finalScore, rawScore, correctnessRatio } = calculateGradualCreditPoints(
    maxPoints,
    correctOptions.length,
    incorrectOptions.length,
    selectedCorrectOptions.length,
    selectedIncorrectOptions.length,
    threshold,
    negativeMarking,
  )

  return {
    totalPoints: maxPoints,
    correctOptions: correctOptions.length,
    incorrectOptions: incorrectOptions.length,
    selectedCorrectOptions: selectedCorrectOptions.length,
    selectedIncorrectOptions: selectedIncorrectOptions.length,
    threshold,
    negativeMarking,
    rawScore,
    correctnessRatio,
    finalScore
  }
}

const extractAllOrNothingData = (maxPoints, solution, answer) => {
  const correctOptions = solution.options.filter(
    (option) => option.isCorrect,
  )
  const incorrectOptions = solution.options.filter(
    (option) => !option.isCorrect,
  )

  const selectedCorrectOptions = answer.options.filter(
    (answer) => correctOptions.some((option) => option.id === answer.id),
  )

  const selectedIncorrectOptions = answer.options.filter(
    (answer) => incorrectOptions.some((option) => option.id === answer.id),
  )

  const finalScore = selectedCorrectOptions.length === correctOptions.length ? maxPoints : 0

  return { 
    totalPoints: maxPoints,
    correctOptions: correctOptions.length,
    incorrectOptions: incorrectOptions.length,
    selectedCorrectOptions: selectedCorrectOptions.length,
    selectedIncorrectOptions: selectedIncorrectOptions.length,
    finalScore 
  }

}


const GradingPolicyCalculation = ({ gradingPolicy, maxPoints, solution, answer }) => {

  const [ data, setData ] = useState(null)

  useEffect(() => {
    switch (gradingPolicy) {
      case MultipleChoiceGradingPolicyType.GRADUAL_CREDIT: {
        setData(extractGradualCreditData(maxPoints, solution, answer))
        break
      }
      case MultipleChoiceGradingPolicyType.ALL_OR_NOTHING: {
        setData(extractAllOrNothingData(maxPoints, solution, answer))
        break
      }
      default:
        setData(null)
    }
  }, [gradingPolicy, maxPoints, solution, answer])
  
  return (
    data && 
    <UserHelpPopper label={
      <Typography variant="body2" color="textSecondary" noWrap>
        {gradingPolicyToLabel[gradingPolicy]} <b>({data.finalScore} pts)</b>
      </Typography>
    }>
      {(() => {
      switch (gradingPolicy) {
        case MultipleChoiceGradingPolicyType.GRADUAL_CREDIT: {
          return (
            <GradualPolicyCalculationBreakdown
              {...data}
            />
          )
        }
        case MultipleChoiceGradingPolicyType.ALL_OR_NOTHING: {
          return (
            <AllOrNothingPolicyCalculationBreakdown
              {...data}
            />
          )
        }
        // Add cases for other grading policies here
        default:
          return null
      }
    })()}
    </UserHelpPopper>
  )
}

export default GradingPolicyCalculation
  