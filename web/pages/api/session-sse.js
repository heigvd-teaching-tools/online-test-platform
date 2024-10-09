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
import { getUser } from "@/code/auth";

const MESSAGE_INTERVAL = 3000;

export default async function handler(req, res) {
    console.log("Opening SSE connection");

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'close'); // Disable keep-alive to detect disconnections
    res.flushHeaders(); // Ensure headers are sent immediately to keep the connection open

    // Function to send an SSE event with session status
    const sendSessionStatusEvent = (status) => {
        res.write(`data: ${JSON.stringify({ status })}\n\n`);
        res.flush(); // Ensure the data is sent to the client immediately
    };

    try {
        // Initial check for the user's session
        const user = await getUser(req, res);
        sendSessionStatusEvent(user ? 'authenticated' : 'unauthenticated');

        // Check session status every few seconds and send updates
        const sessionCheckInterval = setInterval(async () => {
            if (req.socket.destroyed) {
                clearInterval(sessionCheckInterval);
                console.log("Connection destroyed, closing SSE.");
                res.end();
                return;
            }

            const user = await getUser(req, res);
            console.log("Checking session status", user?.email, user ? 'authenticated' : 'unauthenticated');
            sendSessionStatusEvent(user ? 'authenticated' : 'unauthenticated');
        }, MESSAGE_INTERVAL);

    } catch (error) {
        console.error("Error handling SSE connection:", error);
        res.status(500).end();
    }
}
