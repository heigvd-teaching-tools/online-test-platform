import {getRole, getUser} from '../code/auth';

/*
    Function to check if a users is member of the group
    for group scoped endpoints
*/

export function withGroupScope(handler) {
    return async (req, res) => {
        const { groupScope } = req.query;

        if (!groupScope) {
            return res.status(400).json({ message: 'Group scope is required' });
        }

        const user = await getUser(req)

        const isMember = user.groups.some(g => g === groupScope)
        console.log("withGroupScope", req.method, req.url, "isMember", isMember, "groupScope", groupScope,  "userGroups [", user.groups.join(", "), "]")
        if (!isMember) {
            return res.status(401).json({ message: 'You are not authorized to access this group' });
        }

        return handler(req, res);
    };
}

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

        await handler(req, res);
    };
}
