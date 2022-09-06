import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, Role } from '@prisma/client';

const professors = [ 'bchapuis@gmail.com', 'stefanteofanovic@hotmail.com'];

const prisma = new PrismaClient();

export default NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    events: {
        async createUser({ user }) {
            if (professors.includes(user?.email)) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: { role: Role.PROFESSOR },
                });
            }
        }
    },
    callbacks: {
        async session({ session, user }) {
            session.user.role = user.role;
            return session;
        }
    }
    
});