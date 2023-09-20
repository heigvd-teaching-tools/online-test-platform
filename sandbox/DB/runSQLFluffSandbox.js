
import { runSandbox } from "./runSandboxTC.js"
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

    return JSON.parse(out);
}