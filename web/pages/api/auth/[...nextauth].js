import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import KeycloakProvider from 'next-auth/providers/keycloak'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient, Role } from '@prisma/client'

const professors = ['bchapuis@gmail.com', 'stefanteofanovic@hotmail.com']

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
  ],
  events: {
    async createUser({ user }) {
      if (professors.includes(user?.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: Role.PROFESSOR },
        })
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        const userWithGroups = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            groups: {
              include: {
                group: true,
              },
            },
          },
        })

        if (userWithGroups) {
          session.user.groups = userWithGroups.groups
          session.user.selected_group = userWithGroups.groups.find(
            (g) => g.selected
          )?.group
        }
      }
      session.user.id = user.id
      session.user.role = user.role
      return session
    },
  },
})
