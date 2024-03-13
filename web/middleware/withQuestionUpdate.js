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
import { getPrisma } from './withPrisma'

export function withQuestionUpdate(handler) {
  const prisma = getPrisma()

  return async (req, res) => {
    // Wrap the original response.send function
    const originalSend = res.send.bind(res)

    // Replace the res.send function with custom logic
    res.send = async function (...args) {
      // Call the original send function to send the response
      originalSend(...args)

      // Check if the response was successful
      if (res.statusCode === 200) {
        const { questionId } = req.query

        // Update the updatedAt field of the related Question
        try {
          await prisma.question.update({
            where: { id: questionId },
            data: { updatedAt: new Date() },
          })
        } catch (error) {
          console.error('Error updating question:', error)
          // Handle error as needed
        }
      }
    }

    // Execute the original handler
    await handler(req, res, prisma)
  }
}
