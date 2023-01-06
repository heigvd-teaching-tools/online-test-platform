import { runSandboxNode, runSandboxJava } from "./runSandboxTC.js";

const codeNodejs = `
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
})

process.stdin.on("end", () => {
});
`;

const codeJava = `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while(sc.hasNextLine()) {
            System.out.println(sc.nextLine().toUpperCase());
        }
    }
}
`;


const tests = [
  {
    "input": "test world\ntest world2\ntest world3",
    "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
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


runSandboxNode(codeNodejs, tests, "test").then((result) => {
    console.log("NODEJS RESULT : ", result);
});

runSandboxJava(codeJava, tests, "test").then((result) => {
    console.log("JAVA RESULT : ", result);
});
