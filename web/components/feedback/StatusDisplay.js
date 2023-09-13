import Image from "next/image";

const StatusDisplay = ({ status }) => {
    const renderStatus = (status) => {
        switch (status) {
            case "SUCCESS":
                return <Image src="/svg/status/success.svg" width={16} height={16} />
            case "ERROR":
                return <Image src="/svg/status/error.svg" width={16} height={16} />
            case "WARNING":
                return <Image src="/svg/status/warning.svg" width={16} height={16} />
            case "RUNNING":
                return <Image src="/svg/status/running.svg" width={16} height={16} />
            case "NEUTRAL":
                return <Image src="/svg/status/neutral.svg" width={16} height={16} />
            default:
                return null
        }
    }
    return renderStatus(status)
}

export default StatusDisplay;
