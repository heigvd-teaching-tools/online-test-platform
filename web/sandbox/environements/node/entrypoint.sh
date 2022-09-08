#!/bin/sh
## Licensed under the terms of http://www.apache.org/licenses/LICENSE-2.0

codeRun=$(node ${CODE} 2>&1)

if [ "$MODE" = "test" ] 
then
    solutionRun=$(node ${SOLUTION} 2>&1)
    
    if [ "${codeRun}" = "${solutionRun}" ] 
    then
        echo '{ "success": true, "result": "'"${codeRun}"'", "expected": "'"${solutionRun}"'"}'
    else 
        echo '{ "success": false, "result": "'"${codeRun}"'", "expected": "'"${solutionRun}"'"}'
    fi
else
    echo "$codeRun" 
fi