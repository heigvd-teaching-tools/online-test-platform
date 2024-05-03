/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { QuestionType, CodeQuestionType } from '@prisma/client'
import React, { useState } from 'react'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import { Stack, Typography, MenuItem, Box } from '@mui/material'
import { toArray as typesToArray } from '@/components/question/types'
import AlertFeedback from '@/components/feedback/AlertFeedback'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import LanguageSelector from '@/components/question/type_specific/code/LanguageSelector'
import TypeSelector from '@/components/question/TypeSelector'

import languages from '@/code/languages.json'
import DropDown from '@/components/input/DropDown'
import CodeQuestionTypeIcon from '@/components/question/type_specific/code/CodeQuestionTypeIcon'

const types = typesToArray()

const defaultLanguage = languages.environments[0].language

const listOfCodeQuestionTypes = Object.keys(CodeQuestionType).map((key) => ({
  value: key,
}))

const AddQuestionDialog = ({ open, onClose, handleAddQuestion }) => {
  const [type, setType] = useState(types[0].value)
  const [language, setLanguage] = useState(defaultLanguage)
  const [codeQuestionType, setCodeQuestionType] = useState(
    CodeQuestionType.codeWriting,
  )

  const [codeWritingTemplate, setCodeWritingTemplate] = useState('basic')

  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title={`Create new question`}
      content={
        <Stack spacing={2}>
          <Typography variant="body1">
            Select the type of question you want to create
          </Typography>
          <Stack
            spacing={1}
            sx={{ width: '500px' }}
            direction={'row'}
            alignItems={'center'}
          >
            <TypeSelector type={type} onChange={setType} />
            <QuestionTypeIcon type={type} size={50} />
          </Stack>
          {type === QuestionType.code && (
            <>
              <Typography variant="body1">
                Select the language and type of the code question
              </Typography>
              <Stack direction="row" spacing={2}>
                <LanguageSelector 
                  language={language} 
                  onChange={setLanguage} 
                />
                <CodeQuestionTypeSelector
                  options={listOfCodeQuestionTypes}
                  codeQuestionType={codeQuestionType}
                  setCodeQuestionType={setCodeQuestionType}
                />
              </Stack>
              <CodeWritingStartingTemplate 
                language={language} 
                codeWritingTemplate={codeWritingTemplate}
                setCodeWritingTemplate={setCodeWritingTemplate}
              />
            </>
          )}
          <AlertFeedback severity="warning">
            <Typography variant="body1">
              You cannot change the type of a question after it has been
              created.
            </Typography>
          </AlertFeedback>
        </Stack>
      }
      onConfirm={() => handleAddQuestion(type, { language, codeQuestionType, codeWritingTemplate })}
    />
  )
}

/*

{
      "language": "javascript",
      "extension": "js",
      "label": "JavaScript",
      "icon": "/svg/languages/javascript.svg",
      "sandbox": {
        "image": "node:latest",
        "defaultPath": "/src/script.js",
        "exec": "node /src/script.js",
        "beforeAll": ""
      },
      "codeWriting": [{
        "label": "Basic",
        "value": "basic",
        "description": "Basic input / output example",
        "setup": {
          "testCases": [
            {
              "exec": "node /src/script.js",
              "input": "Hello World1",
              "expectedOutput": "HELLO WORLD1\n"
            }
          ],
          "files": {
            "solution": [
              {
                "path": "/src/script.js",
                "content": "\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    console.log(line.toUpperCase());\n});"
              }
            ],
            "template": [
              {
                "path": "/src/script.js",
                "content": "const readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    console.log(line);\n});"
              }
            ]
          }
        }
       
      }],
      "codeReading": {
        "context": "\n\n{{SNIPPET_FUNCTION_DECLARATIONS}}\n\nfunction main() {\n    const readline = require('readline');\n    const rl = readline.createInterface({\n        input: process.stdin,\n        output: process.stdout\n    });\n    rl.on('line', (functionName) => {\n        {{SNIPPET_FUNCTION_CALLS}}\n        rl.close();\n    });\n}\nmain();",
        "snippetWrapperFunctionSignature": "function {{SNIPPET_FUNCTION_NAME}}(){\n{{SNIPPET_FUNCTION_BODY}}\n}",
        "snippetFunctionCallTemplate": "if (functionName === '{{SNIPPET_FUNCTION_NAME}}') { {{SNIPPET_FUNCTION_NAME}}(); }\n",
        "snippets": [
          {
            "snippet": "let s = 'hello, world';\ns = s.toUpperCase();\nconsole.log(s);",
            "output": "HELLO, WORLD\n"
          },
          {
            "snippet": "for (let i = 0; i < 3; i++) {\n    console.log(i);\n}",
            "output": "0\n1\n2\n"
          },
          {
            "snippet": "let i = 11;\nwhile (i > 4) {\n    i -= 2;\n    console.log(i + ' ');\n}",
            "output": "9 \n7 \n5 \n3 \n"
          },
          {
            "snippet": "let str = '';\nfor (let c = 'A'; c <= 'C'; c = String.fromCharCode(c.charCodeAt(0) + 1)) {\n    str = str + c + str;\n}\nconsole.log(str);",
            "output": "ABACABA\n"
          }
        ]
      }
    }
*/

const CodeQuestionTypeSelector = ({
  options,
  codeQuestionType,
  setCodeQuestionType,
}) => {
  const helperText =
    codeQuestionType === CodeQuestionType.codeReading
      ? 'Understand the code and guess the output'
      : 'Write the code and pass codecheck'
  return (
    <DropDown
      id="codeQuestionType"
      name="Code Question Type"
      defaultValue={codeQuestionType}
      minWidth="150px"
      onChange={setCodeQuestionType}
      helperText={helperText}
    >
      {options.map((type, i) => (
        <MenuItem key={i} value={type.value}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CodeQuestionTypeIcon size={20} codeType={type.value} withLabel />
          </Stack>
        </MenuItem>
      ))}
    </DropDown>
  )
}

const CodeWritingStartingTemplate = ({ 
  language,
  codeWritingTemplate,
  setCodeWritingTemplate,
}) => {

  const template = languages.environments
    .find((env) => env.language === language)
    .codeWriting.find((cw) => cw.value === codeWritingTemplate)

  return (
    <DropDown 
      id="template"
      name="Starter Template"
      defaultValue={codeWritingTemplate}
      minWidth="140px"
      onChange={setCodeWritingTemplate}
      helperText={template.description}
    >
      {languages.environments
        .find((env) => env.language === language)
        .codeWriting.map((template, i) => (
          <MenuItem key={i} value={template.value}>
            {template.label}
          </MenuItem>
        ))}
    </DropDown>
  )
}

export default AddQuestionDialog
