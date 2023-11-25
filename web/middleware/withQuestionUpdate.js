import { getPrisma } from "./withPrisma";

export function withQuestionUpdate(handler) {
    const prisma = getPrisma();

    return async (req, res) => {
        // Wrap the original response.send function
        const originalSend = res.send.bind(res);

        // Replace the res.send function with custom logic
        res.send = async function(...args) {
            // Call the original send function to send the response
            originalSend(...args);

            // Check if the response was successful 
            if (res.statusCode === 200) {
                const { questionId } = req.query; 

                // Update the updatedAt field of the related Question
                try {
                    console.log("withQuestionUpdate: updating question", questionId,  new Date())
                    await prisma.question.update({
                        where: { id: questionId },
                        data: { updatedAt: new Date() },
                    });
                } catch (error) {
                    console.error('Error updating question:', error);
                    // Handle error as needed
                }
            }
        };

        // Execute the original handler
        await handler(req, res, prisma);
    };
}
