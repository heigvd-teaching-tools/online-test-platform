import React, {useEffect, useState} from "react";
import {StudentPermission} from "@prisma/client";
import {Stack} from "@mui/material";

import QueryEditor from "@/components/question/type_specific/database/QueryEditor";
import StudentPermissionIcon from "@/components/feedback/StudentPermissionIcon";

const StudentQueryEditor = ({ query:initial, onChange }) => {

    const [ query, setQuery ] = useState(initial);

    useEffect(() => setQuery(initial) , [initial.id]);
    
    return (
        <Stack>
            <QueryEditor
                order={query.order}
                key={query.id}
                headerLeft={<StudentPermissionIcon permission={query.studentPermission} size={16} />}
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
