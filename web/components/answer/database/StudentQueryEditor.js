import React, {useEffect, useState} from "react";
import {Stack} from "@mui/material";
import QueryEditor from "../../question/type_specific/database/QueryEditor";
import {StudentPermission} from "@prisma/client";

const StudentQueryEditor = ({ query:initial, onChange }) => {

    const [ query, setQuery ] = useState(initial);

    useEffect(() => setQuery(initial), [initial.id])

    return (
        <Stack>
            <QueryEditor
                order={query.order}
                key={query.id}
                readOnly={query.studentPermission !== StudentPermission.UPDATE}
                hidden={query.studentPermission === StudentPermission.HIDDEN}
                query={query}
                onChange={(q) => {
                    setQuery(q)
                    onChange && onChange(q)
                }}
            />
        </Stack>
    )
}

export default StudentQueryEditor;