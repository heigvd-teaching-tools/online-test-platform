import { runSandbox } from "./runSandboxTC.js";

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

runSandbox({
  language: 'java', // also used as file extention
  code: codeJava,
  tests: tests,
  mode: 'test'
}).then((result) => {
    console.log("REFACTOR RESULT : ", result);
});

