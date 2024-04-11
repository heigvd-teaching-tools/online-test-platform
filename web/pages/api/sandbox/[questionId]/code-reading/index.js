/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Role } from '@prisma/client'
import { runSandbox } from '@/sandbox/runSandboxTC'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import languages from '@/code/languages.json'

const environments = languages.environments

/*
 endpoint to run the sandbox for a code question of type reading to fill the expected output
 used to run the sandbox for admin, students cant run sandox for code reading
 */
const post = async (req, res, prisma) => {
  const { questionId } = req.query;

  const code = await prisma.code.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      sandbox: true,
      codeReading: {
        select: {
          contextExec: true,
          contextPath: true,
          context: true,
          snippets: {
            orderBy: {
              order: 'asc', // Ensure snippets are ordered by the `order` field in ascending order
            },
          },
        }
      }
    },
  });

  if (!code || !code.codeReading) {
    res.status(404).json({ message: 'Code not found' });
    return;
  }

  // Assuming `environments` is accessible and contains the configs
  const codeReadingConfig = environments.find((env) => env.language === code.language)?.codeReading;

  if (!codeReadingConfig) {
    res.status(500).json({ message: 'Language not supported' });
    return;
  }

  // Generate function declarations and calls
  let functionDeclarations = '';
  let functionCalls = '';
  const tests = []

  code.codeReading.snippets.forEach((snippet, index) => {
    const functionName = `snippetFunc${index}`;
    if(!snippet.snippet || snippet.snippet === "") return;
    const functionDeclaration = codeReadingConfig.snippetWrapperFunctionSignature.replace("{{SNIPPET_FUNCTION_NAME}}", functionName) + " {\n" + snippet.snippet + "\n}";
    functionDeclarations += functionDeclaration + "\n";
    functionCalls += `
      if (functionName == "${functionName}") { 
          ${functionName}(); 
      }\n
    `;
    tests.push({
      exec: code.codeReading.contextExec,
      input: functionName
    })
  });

  // Insert generated function declarations and calls into the context
  let context = codeReadingConfig.context
    .replace("{{SNIPPET_FUNCTION_DECLARATIONS}}", functionDeclarations)
    .replace("{{SNIPPET_FUNCTION_CALLS}}", functionCalls);

  const contextFile = {
    path: code.codeReading.contextPath,
    content: context,
  };

  
  // Execute in the sandbox
  const result = await runSandbox({
    image: code.sandbox.image,
    files: [contextFile],
    beforeAll: code.sandbox.beforeAll,
    tests: tests, 
  });

  res.status(200).send(result);
};

export default withMethodHandler({
  POST: withAuthorization(withPrisma(post), [Role.PROFESSOR]),
})
