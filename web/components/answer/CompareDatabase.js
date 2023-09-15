import React, {useCallback} from 'react'
import {Alert, AlertTitle, Box, Stack, Typography} from '@mui/material'
import { useResizeObserver } from '../../context/ResizeObserverContext'
import ScrollContainer from '../layout/ScrollContainer'
import QueryEditor from "../question/type_specific/database/QueryEditor";
import QueryOutput from "../question/type_specific/database/QueryOutput";
import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QueriesRunSummary from './database/QueriesRunSummary';
import { DatabaseQueryOutputStatus } from '@prisma/client';

const ConsultQuery = ({ header, query, output }) => {

    const hasTestPassed = (studentOutput) => {
        return studentOutput?.testPassed;
    }

    const getTestColor = (studentOutput) => {
        if(!studentOutput) return "info"; // no student output yet -> we display solution output in blue
        const testPassed = hasTestPassed(studentOutput);
        if(testPassed === null) return "info"; // test is running -> we display student output in blue
        // test is finished, we display student output in success if test passed, warning if fail and error if query failed to run
        return testPassed ? "success" : studentOutput.status === DatabaseQueryOutputStatus.ERROR ? "error" : "warning";
    }


  return (
      query && (
      <>
          <QueryEditor
              readOnly
              query={query}
          />
          { output && (
              <QueryOutput
                  header={header}
                  color={query.testQuery ? getTestColor(output) : "info"}
                  result={output}
                  lintResult={query.lintResult}
              />
          )}

      </>
    ))
}


const CompareDatabase = ({ solution, answer }) => {
  const { height: containerHeight } = useResizeObserver()

  const allQueries = answer.queries
  const allTestQueries = answer.queries.filter((saQ) => saQ.query.testQuery)
  const passedTestQueries = allQueries.filter((saQ) => saQ.studentOutput?.output.testPassed)

  const allLintQueries = answer.queries.filter((saQ) => saQ.query.lintRules)
  const passedLintQueries = allLintQueries.filter((saQ) => saQ.query.lintResult?.violations.length === 0)

  const solutionQueries = solution.solutionQueries;

  const getSolutionQuery = useCallback((order) => {
    return solutionQueries.find((sq) => sq.query.order === order)
  }, [solutionQueries])

  return (
    answer &&
    solution && (
      <Stack
        maxHeight={containerHeight}
        height={'100%'}
        width={'100%'}
        maxWidth={'100%'}
      >
        <QueriesRunSummary
            queries={allQueries.map((saQ) => saQ.query)}
            studentOutputs={allQueries.map((saQ) => saQ.studentOutput)}
        />
        <Stack direction={"row"} spacing={1}  width={'100%'} justifyContent={"stretch"}>
          <Box flex={1}>
            <Alert  flex={1} severity={passedTestQueries.length === allTestQueries.length ? 'success' : 'warning'}>
              <AlertTitle>{passedTestQueries.length}/{allTestQueries.length} Output tests passed</AlertTitle>
            </Alert>
          </Box>
          <Box flex={1}>
            <Alert severity={passedLintQueries.length === allLintQueries.length ? 'success' : 'warning'}>
              <AlertTitle>{passedLintQueries.length}/{allLintQueries.length} Lint tests passed</AlertTitle>
            </Alert>
          </Box>
        </Stack>
        <ScrollContainer spacing={2}>
          {
            allQueries.map((saQ) => (
                <LayoutSplitScreen
                    useScrollContainer={false}
                    key={saQ.query.id}
                    height={"auto"}
                    rightWidth={25}
                    leftPanel={
                        <ConsultQuery
                            header={
                                <>
                                  <Typography variant={"caption"}>
                                      Student output
                                  </Typography>
                                  <Typography variant={"caption"}>Last run: {saQ.studentOutput?.updatedAt && new Date(saQ.studentOutput?.updatedAt).toLocaleString()}</Typography>
                                </>
                            }
                            query={saQ.query}
                            output={saQ.studentOutput?.output}
                        />


                    }
                    rightPanel={
                        <ConsultQuery
                            header={
                                    <Typography variant={"caption"}>
                                        Solution output
                                    </Typography>
                            }
                            query={getSolutionQuery(saQ.query.order).query}
                            output={getSolutionQuery(saQ.query.order)?.output.output}
                        />
                    }
                />
            ))
          }
        </ScrollContainer>

      </Stack>
    )
  )
}

export default CompareDatabase
