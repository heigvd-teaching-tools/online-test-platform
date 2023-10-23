import useSWR from 'swr'
import { Button, MenuItem, Stack } from '@mui/material'
import FileEditor from './FileEditor'
import { update, pull } from './crud'
import DropDown from '../../../../input/DropDown'
import { StudentPermission } from '@prisma/client'
import React, {useCallback, useState} from 'react'
import CodeCheck from '../CodeCheck'
import Loading from '../../../../feedback/Loading'
import { fetcher } from '../../../../../code/utils'
import ScrollContainer from '../../../../layout/ScrollContainer'
import {useDebouncedCallback} from "use-debounce";
import BottomCollapsiblePanel from '../../../../layout/utils/BottomCollapsiblePanel'

const TemplateFilesManager = ({ questionId }) => {
  const {
    data: codeToTemplateFiles,
    mutate,
    error,
  } = useSWR(
    `/api/questions/${questionId}/code/files/template`,
    questionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [ lockCodeCheck, setLockCodeCheck ] = useState(false)

  const onFileUpdate = useCallback(
    async (codeToTemplateFile) => {
      setLockCodeCheck(true)
      await update('template', questionId, codeToTemplateFile).then(
        async (updatedFile) => {
          await mutate(
            codeToTemplateFiles.map((codeToFile) =>
              codeToFile.file.id === updatedFile.id
                ? { ...codeToFile, file: updatedFile }
                : codeToFile
            )
          )
        }
      )
      setLockCodeCheck(false)
    },
    [questionId, codeToTemplateFiles, mutate]
  )

  const debouncedOnFileChange = useDebouncedCallback(onFileUpdate, 500)

  const onPullSolution = useCallback(async () => {
    await pull(questionId).then(async (data) => await mutate(data))
  }, [questionId, mutate])

  return (
    <Loading loading={!codeToTemplateFiles} errors={[error]}>
      {codeToTemplateFiles && (
        <BottomCollapsiblePanel
          bottomPanel={
            <CodeCheck
              lockCodeCheck={lockCodeCheck}
              codeCheckAction={() =>
                fetch(`/api/sandbox/${questionId}/files`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    files: codeToTemplateFiles.map((file) => file.file),
                  }),
                })
              }
            />
          }
        >
          <Button onClick={onPullSolution}>Pull Solution Files</Button>
          <ScrollContainer>
            {codeToTemplateFiles.map((codeToTemplateFile, index) => (
              <FileEditor
                key={index}
                file={codeToTemplateFile.file}
                readonlyPath
                onChange={(file) => {
                  setLockCodeCheck(true)
                  debouncedOnFileChange({
                    ...codeToTemplateFile,
                    file,
                  })
                }}
                secondaryActions={
                  <Stack direction="row" spacing={1}>
                    <DropDown
                      id={`${codeToTemplateFile.file.id}-student-permission`}
                      name="Student Permission"
                      defaultValue={codeToTemplateFile.studentPermission}
                      minWidth="200px"
                      onChange={async (permission) => {
                        codeToTemplateFile.studentPermission = permission
                        await onFileUpdate(codeToTemplateFile)
                      }}
                    >
                      <MenuItem value={StudentPermission.UPDATE}>
                        Update
                      </MenuItem>
                      <MenuItem value={StudentPermission.VIEW}>
                        View
                      </MenuItem>
                      <MenuItem value={StudentPermission.HIDDEN}>
                        Hidden
                      </MenuItem>
                    </DropDown>
                  </Stack>
                }
              />
            ))}
          </ScrollContainer>
          
        </BottomCollapsiblePanel>
      )}
    </Loading>
  )
}

export default TemplateFilesManager
