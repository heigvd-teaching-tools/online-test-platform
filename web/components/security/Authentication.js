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
import { useSession } from 'next-auth/react'
import LoadingAnimation from '../feedback/Loading'
import LoginGitHub from './LoginGitHub'

const Authentication = ({ children }) => {
  const { status } = useSession()
  return (
    <>
      {status === 'loading' && <LoadingAnimation />}
      {status === 'unauthenticated' && <LoginGitHub />}
      {status === 'authenticated' && children}
    </>
  )
}
export default Authentication
