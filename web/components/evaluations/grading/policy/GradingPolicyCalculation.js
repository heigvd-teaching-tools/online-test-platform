import UserHelpPopper from "@/components/feedback/UserHelpPopper"
import GradualPolicyCalculationBreakdown from "@/components/evaluations/grading/policy/GradualPolicyCalculationBreakdown"
import { Typography } from "@mui/material"
import { MultipleChoiceGradingPolicyType } from "@prisma/client"

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
  
const GradingPolicyCalculation = ({ gradingPolicy, maxPoints, solution, answer }) => {
  
    switch (gradingPolicy) {
      case MultipleChoiceGradingPolicyType.GRADUAL_CREDIT: {
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
  
        const { finalScore } = calculateGradualCreditPoints(
          maxPoints,
          correctOptions.length,
          incorrectOptions.length,
          selectedCorrectOptions.length,
          selectedIncorrectOptions.length,
          threshold,
          negativeMarking,
        )
        
        return (
          <UserHelpPopper label={
            <Typography variant="body2" color="textSecondary" noWrap>
              {gradingPolicyToLabel[gradingPolicy]} <b>({finalScore} pts)</b>
            </Typography>
          }>
            <GradualPolicyCalculationBreakdown
              totalPoints={maxPoints}
              correctOptions={correctOptions.length}
              incorrectOptions={incorrectOptions.length}
              selectedCorrectOptions={selectedCorrectOptions.length}
              selectedIncorrectOptions={selectedIncorrectOptions.length}
              threshold={threshold}
              negativeMarking={negativeMarking}
              calculator={calculateGradualCreditPoints}
            />
          </UserHelpPopper>
        )
      }
      default:
        return <></>
    }
}

export { GradingPolicyCalculation, calculateGradualCreditPoints}
  