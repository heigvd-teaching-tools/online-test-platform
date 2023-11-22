import { Box, Stack, Tab, Tabs } from "@mui/material"
import ConnectionIndicator from "./ConnectionIndicator"
import EvaluationCountDown from "@/components/evaluations/in-progress/EvaluationCountDown"
import Paging from "@/components/layout/utils/Paging"

const StudentMainMenu = ({ evaluationId, evaluationPhase, pages = [], page }) => {
    return (
       
        <Stack direction="row" alignItems="center">
            <ConnectionIndicator />
            {evaluationPhase.startAt && evaluationPhase.endAt && (
                <Box sx={{ ml: 2 }}>
                    <EvaluationCountDown
                        startDate={evaluationPhase.startAt}
                        endDate={evaluationPhase.endAt}
                    />
                </Box>
            )}
            
            {
                pages.length > 0 && (
                    <Paging
                        items={pages}
                        active={pages[page]}
                        link={(_, index) =>
                            `/users/evaluations/${evaluationId}/take/${index}`
                        }
                    />
                )
            }
        
        </Stack>
    )
}

export default StudentMainMenu