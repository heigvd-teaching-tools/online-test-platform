import { Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { StudentPermission } from '@prisma/client'

const permissionToIcon = {
    [StudentPermission.VIEW]: {
        src: '/svg/icons/viewable.svg',
        alt: 'viewable icon',
        text: 'view',
    },
    [StudentPermission.UPDATE]: {
        src: '/svg/icons/editable.svg',
        alt: 'editable icon',
        text: 'edit',
    },
    [StudentPermission.HIDDEN]: {
        src: '/svg/icons/hidden.svg',
        alt: 'hidden icon',
        text: 'hidden',
    },
}

const StudentPermissionIcon = ({ permission, size=16 }) => {
    return (
        <Image
            alt={permissionToIcon[permission].alt}
            src={permissionToIcon[permission].src}
            width={size}
            height={size}
        />
    )
}

export default StudentPermissionIcon