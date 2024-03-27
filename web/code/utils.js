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
  const res = await fetch(url);
  
  // Read and parse the response body once.
  const data = await res.json();
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // No need to parse the response again, use the already parsed data.
    error.message = data.message || 'An error occurred while fetching the data.';
    error.isGeneric = !data.message;
    error.status = res.status;
    throw error;
  }
  
  // Return the parsed data.
  return data;
}
/*
this link send to users to the PageDispatch which decides (using api evaluation/id/dispatch endpoint) where the users should be directed
* */
export const getStudentEntryLink = (evaluationId) =>
  `${window && window.location.origin}/users/evaluations/${evaluationId}`
