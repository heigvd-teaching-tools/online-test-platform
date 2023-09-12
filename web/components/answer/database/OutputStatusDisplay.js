import Image from "next/image";
import React from "react";
import {DatabaseQueryOutputStatus} from "@prisma/client";

const OutputStatusDisplay = ({ status }) => {
    const renderStatus = (status) => {
        switch (status) {
            case DatabaseQueryOutputStatus.SUCCESS:
                return <Image src="/svg/database/success.svg" width={16} height={16} />
            case DatabaseQueryOutputStatus.ERROR:
                return <Image src="/svg/database/error.svg" width={16} height={16} />
            case DatabaseQueryOutputStatus.WARNING:
                return <Image src="/svg/database/warning.svg" width={16} height={16} />
            case DatabaseQueryOutputStatus.RUNNING:
                return <Image src="/svg/database/running.svg" width={16} height={16} />
            case DatabaseQueryOutputStatus.NEUTRAL:
                return <Image src="/svg/database/neutral.svg" width={16} height={16} />
            default:
                return null
        }
    }
    return renderStatus(status)
}

export default OutputStatusDisplay;
