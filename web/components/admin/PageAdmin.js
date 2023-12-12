import { Role } from "@prisma/client"
import Authorisation from "../security/Authorisation"
import { fetcher } from "@/code/utils"
import Loading from "../feedback/Loading"
import useSWR from "swr"
import UserAvatar from "../layout/UserAvatar"
import DataGrid from "../ui/DataGrid"
import { Stack } from "@mui/material"
import LayoutMain from "../layout/LayoutMain"
import MainMenu from "../layout/MainMenu"
import BackButton from "../layout/BackButton"

const PageAdmin = () => {

    const { data: users, error: errorUsers } = useSWR(`/api/users`, fetcher)

    return (
        <Authorisation allowRoles={[Role.PROFESSOR]}>
            <Loading loading={!users && !errorUsers} error={errorUsers}>
            <LayoutMain 
                hideLogo
                header={
                    <BackButton backUrl="/"/>
                }
            >
                <Stack width="100%" p={2}>
                    <DataGrid
                        header={{
                        actions: {
                            label: 'Actions',
                            width: '80px',
                        },
                        columns: [
                            {
                            label: 'User',
                            column: { minWidth: '220px', flexGrow: 1 },
                            renderCell: (row) => {
                                console.log("row", row)
                                return <UserAvatar user={row} />
                            }
                            }
                        ]
                        }}
                        items={users?.map(user => ({
                            ...user,
                            meta:{
                                key: user.id,
                            }
                        }))}
                    />
                </Stack>
            </LayoutMain>

                    
                
            </Loading>
        </Authorisation>
    )

}

export default PageAdmin