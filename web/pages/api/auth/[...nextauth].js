import NextAuth from 'next-auth'
import KeycloakProvider from "next-auth/providers/keycloak";

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Role } from '@prisma/client'

import { getPrisma } from "@/middleware/withPrisma";

const prisma = getPrisma();

/*

// LEGACY CODE: GitHub provider 
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

*/


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

export const authOptions = {
  adapter: MyAdapter,
  providers: [
    KeycloakProvider({
      clientId: process.env.HEXTAUTH_KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.HEXTAUTH_KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.HEXTAUTH_KEYCLOAK_ISSUER_BASE_URL
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // events: { },
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
      session.user.roles = user.roles
      return session
    },

    async signIn({ user, account, profile }) {    
      /*

        OAuth (NextAuth) behaviour, when connecting with the same email from different providers:
         - If the user is not existant (based on email) next auth will create and link the account to the new user.
         - If the user is existant we will get the error when signin in with another provider : "Account not linked" 

      
        As part of the migration from GitHub to Keycloak, we need to automatically link new accounts to existing users.

        Some students and professors use private emails in their github accounts. 
        
        The professors have been changed to use the heig-vd email by updating the email field of the User. 
        
        For students who use private emails will lose access to their historical data. 
        
        For students using heig-vd emails will be unlinked from github and linked to keycloak. Preserving their historical data.
        
        We decided not to implement manual linking in the user interface, because we will keep the single provider. Moving from Github to Keycloak. 

        TODO : The following procedure is temporal and should be removed after enough time has passed, ie. 1 semester starting from 13.02.2024.

      */

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
              roles: [Role.STUDENT],
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

            // unlink the github account 

            const accountToDelete = await prisma.account.findFirst({
              where: {
                provider: 'github',
                userId: existingUser.id,
              },
            });

            if (accountToDelete) {
              await prisma.account.delete({
                where: {
                  id: accountToDelete.id,
                },
              });
            }
          }
          return true;
        }
      }
    
      return false;
    }
    
  },
}


export default NextAuth(authOptions)
