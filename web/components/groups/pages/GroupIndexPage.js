import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useGroup} from "@/context/GroupContext";
import Unauthorized from "@/components/security/Unauthorized";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

/*
* Group scope index page
* When user access /<groupScope> it will redirect to /<groupScope>/questions
* The group will also be switched
* */
const GroupIndexPage = () => {
    const router = useRouter()
    const groupScope = router.query.groupScope
    const [ status, setStatus ] = useState(200)
    const { switchGroup } = useGroup()

    useEffect(() => {
        if(groupScope) {
            (async () => {
                const response = await switchGroup(groupScope)
                const status = response.status;
                setStatus(status)
                if(status === 200) {
                    await router.push(`${router.query.groupScope}/questions`)
                }
            })()
        }
    }, [groupScope, router, switchGroup])

    return status === 200 ? <LoadingAnimation /> : <Unauthorized>You are not authorized to access this group</Unauthorized>
}

export default GroupIndexPage