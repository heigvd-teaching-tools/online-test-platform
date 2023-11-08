import { getRole } from '../code/auth';

export function withAuthorization(handler, allowedRoles) {
    return async (req, res) => {
        const userRole = await getRole(req);
        const isAuthorized = allowedRoles.includes(userRole);

        if (!isAuthorized) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return handler(req, res);
    };
}

export function withMethodHandler(methodHandlers) {
    return async (req, res) => {
        const handler = methodHandlers[req.method];
        if (!handler) {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        try {
            await handler(req, res);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}
