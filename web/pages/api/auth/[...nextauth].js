import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import KeycloakProvider from 'next-auth/providers/keycloak'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient, Role } from '@prisma/client'

import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import fetch from "node-fetch";
import fs from 'fs';

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: fs.readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH, 'utf8'),
    installationId: process.env.GITHUB_APP_INSTALLATION_ID,
  },
  request: {
    fetch,
  },
});

const getOrgMembersIDs = async () => {
    const { data: members } = await octokit.rest.orgs.listMembers({
      org: process.env.GITHUB_ORG,
    });
    return members.map((member) => member.id);
}

const setProfessorIfMemberOfOrg = async (account, user) => {
  if(account.provider === 'github' && user.role !== Role.PROFESSOR) {
    const memberIDs = await getOrgMembersIDs();
    if (memberIDs.includes(parseInt(account.providerAccountId))) {
      await prisma.user.update({
        where: {email: user.email},
        data: {role: Role.PROFESSOR},
      })
      return true;
    }
  }
  return false;
}

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.NEXTAUTH_GITHUB_ID,
      clientSecret: process.env.NEXTAUTH_GITHUB_SECRET,
    }),
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {

    async linkAccount({ user, account})  {
        if(await setProfessorIfMemberOfOrg(account, user)){
            // update session to reflect new role
            return { ...user, role: Role.PROFESSOR }
        }
    },
    async signIn({ user, account }) {
        if(await setProfessorIfMemberOfOrg(account, user)){
            // update session to reflect new role
            return { ...user, role: Role.PROFESSOR }
        }
    }
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
