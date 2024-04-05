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

import { DatabaseQueryOutputStatus } from '@prisma/client'
import Handlebars from 'handlebars'
import { Remarkable } from 'remarkable'
import hljs from 'highlight.js'

const md = new Remarkable({
  highlight: function (str, lang) {
    let highlighted = ''

    if (lang && hljs.getLanguage(lang)) {
      try {
        // Update to the new API usage
        highlighted = hljs.highlight(str, {
          language: lang,
          ignoreIllegals: true,
        }).value
      } catch (__) {}
    }

    return highlighted // Return the highlighted code, or an empty string if highlighting failed
  },
})

export const formatCode = (code) => {
  // wrap it in markdown code block
  code = `\`\`\`
    \n${code}`

  // apply the md renderer to the escaped code
  code = md.render(code)

  return new Handlebars.SafeString(code)
}

export const formatMarkdown = (markdown) => {
  return new Handlebars.SafeString(md.render(markdown))
}

export const equals = (a, b) => {
  return a === b
}

export const formatQuestionType = (type) => {
  // Split camelCase into words, then capitalize the first letter of each word
  const formattedType = type
    // Insert a space before each uppercase letter and split into an array
    .replace(/([A-Z])/g, ' $1')
    // Split the string into words
    .trim()
    .toLowerCase()
    .split(' ')
    // Capitalize the first letter of each word
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    // Join the words back into a string
    .join(' ')

  return formattedType
}

export const countDatabasePassedTests = (queries) => {
  let passedCount = 0
  let totalTestQueries = 0
  queries.forEach((query) => {
    if (query.query.testQuery) {
      totalTestQueries++
      if (
        query.studentOutput &&
        query.studentOutput.status === DatabaseQueryOutputStatus.SUCCESS
      ) {
        passedCount++
      }
    }
  })
  return passedCount + '/' + totalTestQueries
}

export const chunkQuestions = (array, chunkSize, options) => {
  let result = ''
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    result += options.fn(chunk) // Execute the block for each chunk
  }
  return result
}
