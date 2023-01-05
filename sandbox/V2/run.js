import { runSandbox } from "./runSandboxAPI.js";

const code = `
process.stdout.write("Testing standard streams");
process.stdout.write("\\n");
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
    process.stdout.write("\\n");
})

process.stdin.on("end", () => {
    process.stdout.write("Input stream ended")
    process.stdout.write("\\n");
});
`;


const tests = [
  {
    "input": "Hello World",
    "output": "HELLO WORLD"
  },
  {
    "input": "Hello World1",
    "output": "HELLO WORLD1"
  },
  {
    "input": "Hello World2",
    "output": "HELLO WORLD2"
  },
]


runSandbox(code, tests, "test").then((result) => {
    console.log("RESULT : ", result);
});