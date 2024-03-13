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
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Loading from '@/components/feedback/Loading'
import { useGroup } from '@/context/GroupContext'
/*
 * This page is used to redirect the users to the correct group scope
 * */
const IndexPage = () => {
  const router = useRouter()
  const { data: session } = useSession()

  const { groups, switchGroup } = useGroup()

  useEffect(() => {
    let selectedGroup = session?.user?.selected_group

    if (!selectedGroup && groups && groups.length > 0) {
      selectedGroup = groups[0].group.scope
    }

    if (selectedGroup) {
      ;(async () => {
        await switchGroup(selectedGroup)
        await router.push(`/${selectedGroup}/questions`)
      })()
    }
  }, [switchGroup, groups, session])

  return <Loading />
}
export default IndexPage
