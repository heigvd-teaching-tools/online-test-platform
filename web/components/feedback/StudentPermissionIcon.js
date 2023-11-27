import { Stack, Tooltip } from '@mui/material'
import Image from 'next/image'
import { StudentPermission } from '@prisma/client'

const permissionToIcon = {
    [StudentPermission.VIEW]: {
        src: '/svg/icons/viewable.svg',
        tooltip: 'You have view permission',
        text: 'view',
    },
    [StudentPermission.UPDATE]: {
        src: '/svg/icons/editable.svg',
        tooltip: 'You have edit permission',
        text: 'edit',
    },
    [StudentPermission.HIDDEN]: {
        src: '/svg/icons/hidden.svg',
        tooltip: 'You have no permission',
        text: 'hidden',
    },
}

const StudentPermissionIcon = ({ permission, size=16 }) => {
    return (
        <Tooltip title={permissionToIcon[permission].tooltip} placement="bottom">
            <Stack>
                <Image
                    alt={"permission"}
                    src={permissionToIcon[permission].src}
                    width={size}
                    height={size}
                />
            </Stack> 
        </Tooltip>
    )
}

export default StudentPermissionIcon