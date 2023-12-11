import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import KeycloakProvider from "next-auth/providers/keycloak";

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Role } from '@prisma/client'

import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import fetch from "node-fetch";
import fs from 'fs';
import { getPrisma } from "@/middleware/withPrisma";

const prisma = getPrisma();

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


// ISSUE with keycloak provider fixed with workaround:
// https://github.com/nextauthjs/next-auth/issues/3823
const prismaAdapter = PrismaAdapter(prisma);

const MyAdapter = {
  ...prismaAdapter,
  linkAccount: (account) => {
    account["not_before_policy"] = account["not-before-policy"];
    delete account["not-before-policy"];
    return prismaAdapter.linkAccount(account);
  },
};


export default NextAuth({
  adapter: MyAdapter,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER_BASE_URL
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // events: { },
  callbacks: {

    async session({ session, user }) {
      console.log("session callback", user)
      if (user) {
        const userWithGroups = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            groups: {
              include: {
                group: true,
              },
              orderBy: {
                group: {
                  label: 'asc',
                },
              },
            },
          },
        })

        if (userWithGroups) {
          session.user.groups = userWithGroups.groups.map((g) => g.group.scope);
          session.user.selected_group = userWithGroups.groups.find(
            (g) => g.selected
          )?.group.scope
        }
      }
      session.user.id = user.id
      session.user.role = user.role
      return session
    },

    async signIn({ user, account, profile }) {
      console.log("sign in callback", user, account, profile);
    
      // Only proceed if the provider is Keycloak and an email is provided
      if (account.provider === 'keycloak') {
        if (!user.email) {
          return false;
        }

        // Check for an existing user with the same email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        const accountData = {
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_expires_in: account.refresh_expires_in,
          not_before_policy: account["not-before-policy"],
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        }
        
        if(!existingUser) {
          // Create a new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: profile.name,
              role: Role.STUDENT,
            },
          });

          // Link the account
          await prisma.account.create({
            data: {
              userId: newUser.id,
              ...accountData
            },
          });

          return true;
        }

        if (existingUser) {
          // Check if the account is already linked
          const linkedAccount = await prisma.account.findFirst({
            where: {
              providerAccountId: account.providerAccountId,
              provider: account.provider,
            },
          });
    
          if (!linkedAccount) {

            // update the user name with thrustworthy name from keycloak
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: profile.name,
              },
            });
            

            // Link the account
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                ...accountData
              },
            });
          }
          return true;
        }
      }
    
      return false;
    }
    
  },
})
