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
export const fetcher = async (url) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    try {
      const data = await res.json()
      error.message = data.message
      error.isGeneric = false
    } catch (e) {
      error.isGeneric = true
    }
    error.status = res.status
    throw error
  }
  return res.json()
}

/*
this link send to users to the PageDispatch which decides (using api evaluation/id/dispatch endpoint) where the users should be directed
* */
export const getStudentEntryLink = (evaluationId) =>
  `${window && window.location.origin}/users/evaluations/${evaluationId}`
