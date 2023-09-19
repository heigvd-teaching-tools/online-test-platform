import { cleanUpDockerStreamHeaders } from "./utils";
import { runSandbox } from "./runSandboxTC.js";

export const runSQLFluffSandbox = async ({ sql, rules = '' }) => {

    const response = await runSandbox({
        image: 'custom-sqlfluff',
        files: [{
            path: ".sqlfluff",
            content: rules
        }],
        tests:[
            {
                exec: `sqlfluff lint - --dialect postgres --format json`,
                input: sql,
            }
        ]
    })

    const out = response.tests[0]?.output;

    return groupByViolations(
        JSON.parse(
            cleanUpDockerStreamHeaders(out)
        )
    );
}


const groupByViolations = (lintResults) => {
    if(lintResults.length === 0){
        return {
            violations: []
        };
    }

    const lintResult = lintResults[0];

    const groupedViolations = {};

    lintResult.violations.forEach((violation) => {
        const { line_no, line_pos, code, description, name } = violation;

        if (!groupedViolations[code]) {
            groupedViolations[code] = {
                description,
                name,
                code,
                lines: [],
            };
        }

        groupedViolations[code].lines.push({ line: line_no, pos: line_pos });
    });

    lintResult.violations = Object.values(groupedViolations);

    return lintResult;
}