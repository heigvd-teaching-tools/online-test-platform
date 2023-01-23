import { runSandbox } from "./runSandboxTC.js";
import {getProject} from "./git_browser/readFromGit.js";

const codeNodejs = `
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
    process.stdout.write("\\n")
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

const codeCPP = `
#include <iostream>
#include <string>
using namespace std;

string toUpperCase(string str) {
    for(int i = 0; i < str.length(); i++) {
        if(str[i] >= 'a' && str[i] <= 'z') {
            str[i] = str[i] - 32;
        }
    }
    return str;
}


int main() {
    string line;
    while(getline(cin, line)) {
        cout << toUpperCase(line) << endl;
    }
    return 0;
}

`;

const codePython = `
import sys

for line in sys.stdin:
    print(line.upper(), end='')
`;

/*
runSandbox({
  language: 'py', // also used as file extention
  code: codePython,
  tests: tests,
  mode: 'test'
}).then((result) => {
    console.log("REFACTOR RESULT : ", result);
});
*/

await getProject({
    pat:  "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",
    owner: "Ovich",
    repo: "fastapi_keycloak_service_account",
    ref: "main"
});

runSandbox({
    image: 'node:latest',
    files: [{
        path: 'src/main.js',
        content: codeNodejs
    }],
    tests: [
        {
          "exec": "node /src/main.js",
          "input": "test world\ntest world2\ntest world3",
          "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
        },
        {
          "exec": "node /src/main.js",
          "input": "Hello World1",
          "output": "HELLO WORLD1"
        },
        {
          "exec": "node /src/main.js",
          "input": "Hello World2",
          "output": "HELLO WORLD2"
        },
      ],
    compile: undefined,
}).then((result) => {
    console.log("NODEJS RESULT : ", result);
});



runSandbox({
    image: 'openjdk:latest',
    files: [{
        path: 'src/Main.java',
        content: codeJava
    }],
    compile: "javac /src/Main.java",
    tests: [
        {
            "exec": "java -cp /src Main",
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
        },
        {
            "exec": "java -cp /src Main",
            "input": "Hello World1",
            "output": "HELLO WORLD1"
        },
        {
            "exec": "java -cp /src Main",
            "input": "Hello World2",
            "output": "HELLO WORLD2"
        },
    ],
}).then((result) => {
    console.log("JAVA RESULT : ", result);
});

runSandbox({
    image: 'gcc:latest',
    files: [{
        path: 'src/main.cpp',
        content: codeCPP
    }],
    compile: "g++ /src/main.cpp -o /src/main",
    tests: [
        {
            "exec": "/src/main",
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
        },
        {
            "exec": "/src/main",
            "input": "Hello World1",
            "output": "HELLO WORLD1"
        },
        {
            "exec": "/src/main",
            "input": "Hello World2",
            "output": "HELLO WORLD2"
        },
    ],
}).then((result) => {
    console.log("CPP RESULT : ", result);
});

runSandbox({
    image: 'python:latest',
    files: [{
        path: 'src/main.py',
        content: codePython
    }],
    tests: [
        {
            "exec": "python /src/main.py",
            "input": "test world\ntest world2\ntest world3",
            "output": "TEST WORLD\nTEST WORLD2\nTEST WORLD3"
        },
        {
            "exec": "python /src/main.py",
            "input": "Hello World1",
            "output": "HELLO WORLD1"
        },
        {
            "exec": "python /src/main.py",
            "input": "Hello World2",
            "output": "HELLO WORLD2"
        },
    ],
}).then((result) => {
    console.log("PYTHON RESULT : ", result);
});




/*
runSandbox(codeNodejs, tests, "test").then((result) => {
    console.log("API RESULT : ", result);
});
*/


