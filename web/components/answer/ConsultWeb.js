import {useResizeObserver} from "../../context/ResizeObserverContext";
import Web from "../question/type_specific/Web";

const ConsultWeb = ({ answer }) => {
    const { height: containerHeight } = useResizeObserver();
    return (
        <Web
            readOnly={true}
            web={answer}
            containerHeight={containerHeight}
        />
    )

}

export default ConsultWeb;
