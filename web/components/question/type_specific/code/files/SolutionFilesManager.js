import useSWR from 'swr'
import React, {useCallback, useRef, useState} from 'react'
import { create, del, update } from './crud'
import { Button, IconButton, Stack } from '@mui/material'
import FileEditor from './FileEditor'
import Image from 'next/image'

import languages from '../../../../../code/languages.json'
import CodeCheck from '../CodeCheck'
import Loading from '../../../../feedback/Loading'
import { fetcher } from '../../../../../code/utils'
import ScrollContainer from '../../../../layout/ScrollContainer'
import {useDebouncedCallback} from "use-debounce";
import BottomCollapsiblePanel from '../../../../layout/utils/BottomCollapsiblePanel'

const environments = languages.environments
const SolutionFilesManager = ({ groupScope, questionId, language }) => {
  const filesRef = useRef()

  const {
    data: codeToSolutionFiles,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/files/solution`,
      groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [ lockCodeCheck, setLockCodeCheck ] = useState(false)

  const onAddFile = useCallback(async () => {
    const extension = environments.find(
      (env) => env.language === language
    ).extension
    const path = `/src/file${codeToSolutionFiles?.length || ''}.${extension}`

    await create('solution', groupScope, questionId, {
      file: {
        path,
        content: '',
      },
    }).then(async (newFile) => {
      await mutate([...codeToSolutionFiles, newFile])
      // scroll to the bottom of the files list
      filesRef.current.scrollTop = filesRef.current.scrollHeight
    })
  }, [groupScope, questionId, codeToSolutionFiles, mutate, language])

  const onFileUpdate = useCallback(
    async (file) => {
      setLockCodeCheck(true)
      await update('solution', groupScope, questionId, file);
      setLockCodeCheck(false)
    },
    [groupScope, questionId, codeToSolutionFiles]
  )

  const debouncedOnFileChange = useDebouncedCallback(onFileUpdate, 500)

  const onDeleteFile = useCallback(
    async (codeToSolutionFile) => {
      await del('solution', groupScope, questionId, codeToSolutionFile).then(
        async (msg) => {
          await mutate(
            codeToSolutionFiles.filter(
              (file) => file.id !== codeToSolutionFile.id
            )
          )
        }
      )
    },
    [groupScope, questionId, mutate, codeToSolutionFiles]
  )

  return (
    <Loading loading={!codeToSolutionFiles} errors={[error]}>
      {codeToSolutionFiles && (
         <BottomCollapsiblePanel
            bottomPanel={
              <CodeCheck
                lockCodeCheck={lockCodeCheck}
                codeCheckAction={() =>
                  fetch(`/api/sandbox/${questionId}/files`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      files: codeToSolutionFiles.map((file) => file.file),
                    }),
                  })
                }
              />
            }
            >
            <Button onClick={onAddFile}>Add File</Button>
            <ScrollContainer ref={filesRef} pb={24}>
              {codeToSolutionFiles.map((codeToSolutionFile, index) => (
                <FileEditor
                  key={index}
                  file={codeToSolutionFile.file}
                  onChange={(file) => {
                      setLockCodeCheck(true)
                      debouncedOnFileChange({
                        ...codeToSolutionFile,
                        file,
                      })
                  }}
                  secondaryActions={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        key="delete-file"
                        onClick={async () =>
                          await onDeleteFile(codeToSolutionFile)
                        }
                      >
                        <Image
                          alt="Delete"
                          src="/svg/icons/delete.svg"
                          layout="fixed"
                          width="18"
                          height="18"
                        />
                      </IconButton>
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

export default SolutionFilesManager
