import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import { useEffect } from "react";
import Loading from "@/components/feedback/Loading";
import {useGroup} from "@/context/GroupContext";
/*
* This page is used to redirect the users to the correct group scope
* */
const IndexPage = () => {
    const router = useRouter()
    const { data: session } = useSession()

    const { groups , switchGroup} = useGroup()

    useEffect(() => {
        let selectedGroup = session?.user?.selected_group

        if(!selectedGroup && groups && groups.length > 0) {
            selectedGroup = groups[0].group.scope
        }

        if(selectedGroup) {
            (async () => {
                await switchGroup(selectedGroup)
                await router.push(`/${selectedGroup}/questions`)
            })()
        }
    }, [switchGroup, groups, session]);

    return (
        <Loading />
    )
}
export default IndexPage