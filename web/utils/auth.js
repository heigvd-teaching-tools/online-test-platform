import { getSession } from 'next-auth/react';

const hasRole = async (req, role) => {
    const session = await getSession({ req });
    console.log("hasRole user", session.user)
    return session && session.user && session.user.role === role;
}

const getUser = async (req) => {
    const session = await getSession({ req });
    return session && session.user;
}

export { hasRole, getUser };
