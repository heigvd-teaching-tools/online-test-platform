import { Box, IconButton, Stack, Tooltip } from "@mui/material"
import ConnectionIndicator from "./ConnectionIndicator"
import EvaluationCountDown from "@/components/evaluations/in-progress/EvaluationCountDown"
import Paging from "@/components/layout/utils/Paging"
import Image from "next/image"

const StudentMainMenu = ({ evaluationId, evaluationPhase, pages = [], page, openSummary }) => {
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
            <Stack direction="row" flex={1} overflow={"auto"}>
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
            <Tooltip title="Open questions summary panel">
            <IconButton
                onClick={openSummary}
            >
                <Image
                    src={`/svg/icons/ordered-list.svg`}
                    width={20}
                    height={20}
                    priority="1"
                />
            </IconButton>
            </Tooltip>
        
        </Stack>
    )
}

export default StudentMainMenu