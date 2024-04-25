import PassIndicator from "@/components/feedback/PassIndicator"
import { Stack, Typography } from "@mui/material"

const CodeWritingTabLabelTestSummary = ({ testCaseResults }) => {
    return ( testCaseResults &&
      <Stack spacing={1} direction="row">
        {testCaseResults.length > 0 ? (
          <>
            <PassIndicator
              passed={testCaseResults.every(
                (test) => test.passed,
              )}
            />
            <Typography variant="caption">
              {`${
                testCaseResults.filter(
                  (test) => test.passed,
                ).length
              } / ${
                testCaseResults.length
              } tests passed`}
            </Typography>
        </>
      ) : (
        <Typography variant="caption">
          No code-check runs
        </Typography>
      )}
    </Stack>
    )
}

export default CodeWritingTabLabelTestSummary