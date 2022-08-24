import { getSession } from 'next-auth/react';

const hasRole = async (req, role) => {
    const session = await getSession({ req });
    return session && session.user && session.user.role === role;
}

export { hasRole };