import { runSandbox } from "./runSandboxTC.js"
import { runSQLFluffSandbox } from "./runSQLFluffSandbox.js"

const rules = `[sqlfluff]
exclude_rules = AM04`

const runLint = async () => {

    const result = await runSQLFluffSandbox({
        sql: "SELECT * FROM ",
        rules: rules
    })

    console.log("result", result)

}



runLint();