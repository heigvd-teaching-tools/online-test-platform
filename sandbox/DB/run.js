import { runSQLFluffSandbox } from "./runSQLFluffSandbox.js";


const rules = `[sqlfluff]
exclude_rules = AM04`

const runLint = async () => {

    const testCases = [
        {
            sql: `SELECT * FROM my_table;
            `,
            sqlfluffRules: rules
        },
        
    ];

    for (const testCase of testCases) {
        //console.log("Running test case: ", testCase.description, "\n", testCase.sql);
        const lintResult = await runSQLFluffSandbox({
            sql: testCase.sql,
            sqlfluffRules: testCase.sqlfluffRules,
        });

        console.log("lintResult", lintResult);

    }

}

runLint();