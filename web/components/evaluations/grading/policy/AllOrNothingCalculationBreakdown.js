import KatexBloc from "@/components/input/markdown/KatexBloc"
import { Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"

const AllOrNothingPolicyCalculationBreakdown = ({
    totalPoints,
    correctOptions,
    incorrectOptions,
    selectedCorrectOptions,
    selectedIncorrectOptions,
    finalScore
}) => {
    const allCorrectOptionsSelected = selectedCorrectOptions === correctOptions && selectedIncorrectOptions === 0;

    return (
        <Stack spacing={1}>
            <Typography variant="h6">
                All-Or-Nothing Policy Calculation Breakdown
            </Typography>
            <Typography variant="caption">
                <Box>
                    <Typography variant="body1">Variables</Typography>
                    <ul>
                        <li>Total Points: {totalPoints}</li>
                        <li>Total Correct Options: {correctOptions}</li>
                        <li>Total Incorrect Options: {incorrectOptions}</li>
                        <li>Selected Correct Options: {selectedCorrectOptions}</li>
                        <li>Selected Incorrect Options: {selectedIncorrectOptions}</li>
                    </ul>
                </Box>
                <Box>
                    <KatexBloc
                        code={`
                        \\text{Final Score} = 
                        \\begin{cases} 
                        \\text{Total Points} & \\text{if All Correct Options and No Incorrect Options} \\\\
                        0 & \\text{otherwise}
                        \\end{cases}
                        `}
                    />
                </Box>
                <Typography>
                    <Box>
                        <Typography variant="body1">Calculation Breakdown:</Typography>
                    </Box>
                    
                    <Box>
                        <Typography variant="body2">
                        All Correct Options Selected: {allCorrectOptionsSelected ? "Yes" : "No"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2">
                        Any Incorrect Options Selected: {selectedIncorrectOptions > 0 ? "Yes" : "No"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1"><b>Final Score:</b> {finalScore.toFixed(2)}</Typography>
                    </Box>
                </Typography>
            </Typography>
        </Stack>
    )
}

export default AllOrNothingPolicyCalculationBreakdown
