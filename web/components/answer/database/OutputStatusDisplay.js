import Image from "next/image";
import React from "react";

const OutputStatusDisplay = ({ status }) => {
    const renderStatus = (status) => {
        switch (status) {
            case "SUCCESS":
                return <Image src="/svg/database/success.svg" width={16} height={16} />
            case "ERROR":
                return <Image src="/svg/database/error.svg" width={16} height={16} />
            case "WARNING":
                return <Image src="/svg/database/warning.svg" width={16} height={16} />
            case "RUNNING":
                return <Image src="/svg/database/running.svg" width={16} height={16} />
            default:
                return <Image src="/svg/database/none.svg" width={16} height={16} />
        }
    }
    return renderStatus(status)
}

export default OutputStatusDisplay;
