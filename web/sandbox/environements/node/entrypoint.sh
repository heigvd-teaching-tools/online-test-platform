#!/bin/sh
## Licensed under the terms of http://www.apache.org/licenses/LICENSE-2.0
set -e
codeRun=$(node ${CODE})

## escape special characters 
codeRun=$(echo "$codeRun" | sed 's/"/\\"/g')

if [ "$MODE" = "test" ] 
then
    solutionRun=$(node ${SOLUTION})
    solutionRun=$(echo "$solutionRun" | sed 's/"/\\"/g')
    if [ "${codeRun}" = "${solutionRun}" ] 
    then
        echo '{ "success": true, "result": "'"${codeRun}"'", "expected": "'"${solutionRun}"'"}'
    else 
        echo '{ "success": false, "result": "'"${codeRun}"'", "expected": "'"${solutionRun}"'"}'
    fi
else
    echo "$codeRun" 
fi