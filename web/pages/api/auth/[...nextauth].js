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
import NextAuth from 'next-auth'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Role } from '@prisma/client'

import { getPrisma } from '@/middleware/withPrisma'

const prisma = getPrisma()

const prismaAdapter = PrismaAdapter(prisma)

const MyAdapter = {
  ...prismaAdapter,
  linkAccount: (account) => {
    account['not_before_policy'] = account['not-before-policy']
    delete account['not-before-policy']
    return prismaAdapter.linkAccount(account)
  },
}

/*

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  roles         Role[]
  test         Boolean   @default(false)

  userOnEvaluation UserOnEvaluation[]
  userDeniedAccess UserOnEvaluationDeniedAccessAttempt[]
  studentAnswer    StudentAnswer[]
  gradingSignedBy  StudentQuestionGrading[]
  groups           UserOnGroup[]
  groupsCreated    Group[]
  annotations      Annotation[]
}


*/

const switchEduId = {
  id: 'switch',
  name: 'SWITCH edu-ID',
  type: 'oauth',
  wellKnown: 'https://login.eduid.ch/.well-known/openid-configuration', 
  clientId: process.env.NEXTAUTH_SWITCH_CLIENT_ID,  
  clientSecret: process.env.NEXTAUTH_SWITCH_CLIENT_SECRET, 
  authorization: {
    params: {
      scope: 'openid profile email https://login.eduid.ch/authz/User.Read',
      claims: JSON.stringify({
        id_token: {
          name: { essential: true },
          email: { essential: true },
          swissEduIDLinkedAffiliation: { essential: true },
          swissEduIDAssociatedMail: { essential: true },
          swissEduIDLinkedAffiliationMail: { essential: true },
          swissEduID: { essential: true },
          eduPersonEntitlement: { essential: true },
          eduPersonAffiliation: { essential: true },
        },
      }),
    },
  },
  idToken: true,
  checks: ['pkce', 'state'],
  profile(OAuthProfile) {
    // const identityEmail = OAuthProfile.swissEduIDLinkedAffiliationMail?.[0] || OAuthProfile.email;
    return {
      id: OAuthProfile.sub,
      name: OAuthProfile.name,
      email: OAuthProfile.email,
      image: OAuthProfile.picture,
      roles: [Role.STUDENT],
      affiliations: OAuthProfile.swissEduIDLinkedAffiliationMail,
      selectedAffiliation: null
    }
  },
  
}


export const authOptions = {
  adapter: MyAdapter,
  providers: [
    switchEduId
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {

      if (user) {

        session.user = user

        const userWithExtras = await prisma.user.findUnique({
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

        if (userWithExtras) {
          session.user.groups = userWithExtras.groups.map((g) => g.group.scope)
          session.user.selected_group = userWithExtras.groups.find(
            (g) => g.selected,
          )?.group.scope
        }
      }
      session.user.id = user.id
      session.user.roles = user.roles
      return session
    },

    async signIn({ user: oauthUser, account, profile }) {
      // Only proceed if the provider is SWITCH edu-ID and an email is provided
      if (account.provider === 'switch') {
        if (!oauthUser.email) {
          return false;
        }
    
        const accountData = {
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_expires_in: account.refresh_expires_in,
          not_before_policy: account['not-before-policy'],
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        };
    
        // Transaction for user creation and account linking
        let dbUser;
        await prisma.$transaction(async (prisma) => {
          // Check for an existing user with the same email
          dbUser = await prisma.user.findUnique({
            where: { email: oauthUser.email },
          });
    
          if (!dbUser) {
            // If no existing user is found, create a new one
            const newUser = await prisma.user.create({
              data: {
                email: oauthUser.email,
                name: profile.name,
                roles: [Role.STUDENT],
                image: oauthUser.image,
                affiliations: oauthUser.affiliations,
              },
            });
    
            // Link the new user to the account
            await prisma.account.create({
              data: {
                userId: newUser.id,
                ...accountData,
              },
            });
    
            // Set the newly created user as the existing user for further updates
            dbUser = newUser;
          }
    
          // Proceed with account linking if not already linked
          const linkedAccount = await prisma.account.findFirst({
            where: {
              providerAccountId: account.providerAccountId,
              provider: account.provider,
            },
          });
    
          if (!linkedAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                ...accountData,
              },
            });
          }
        });
    
        // After transaction commits, ensure the user is properly re-fetched for further updates
        dbUser = await prisma.user.findUnique({
          where: { email: oauthUser.email },
        });
    
        // Proceed with affiliation migration outside of the transaction
        await switchMigrateAffiliatedUsers(oauthUser, dbUser);
    
        return true;
      }
    
      return false;
    }
  }
}


const switchMigrateAffiliatedUsers = async (oauthUser, dbUser) => {
  // Check if user has affiliations and manage them
  if (oauthUser.affiliations && oauthUser.affiliations.length > 0) {
    await prisma.$transaction(async (prisma) => {
      for (const affiliation of oauthUser.affiliations) {
        const existingAffiliatedUser = await prisma.user.findFirst({
          where: { email: affiliation },
        });

        if (existingAffiliatedUser) {
          console.log(
            'Existing user found',
            existingAffiliatedUser.id,
            existingAffiliatedUser.email,
            dbUser.id,
            dbUser.email
          );

          // If the existing user is a professor, migrate groups and assign the professor role
          if (existingAffiliatedUser.roles.includes(Role.PROFESSOR)) {
            // Ensure the existingUser.roles is initialized and check if the PROFESSOR role is already assigned
            const currentRoles = dbUser.roles || [];

            // Only add the PROFESSOR role if it is not already present
            if (!currentRoles.includes(Role.PROFESSOR)) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  roles: {
                    set: [...currentRoles, Role.PROFESSOR], // Spread existing roles and add PROFESSOR
                  },
                },
              });
              console.log(`Assigned PROFESSOR role to user: ${dbUser.id}`);
            } else {
              console.log(`User ${dbUser.id} already has the PROFESSOR role.`);
            }

            // Transfer groups from the existing user to the new user
            await prisma.userOnGroup.updateMany({
              where: { userId: existingAffiliatedUser.id },
              data: { userId: dbUser.id },
            });
            console.log(`Groups from user ${existingAffiliatedUser.id} reassigned to ${dbUser.id}`);
          }

          // If the existing user is NOT a professor, treat the new user as the main identity
          if (!existingAffiliatedUser.roles.includes(Role.PROFESSOR)) {
            console.log(`Making ${dbUser.id} the main identity for ${existingAffiliatedUser.id}`);
          }

          // Delete the existing affiliated user if the emails are different
          if (existingAffiliatedUser.email !== dbUser.email) {
            await prisma.user.delete({
              where: { id: existingAffiliatedUser.id },
            });
            console.log(`Deleted existing user with id: ${existingAffiliatedUser.id}`);
          }
        }
      }
    });
  } else {
    console.log('No affiliations found for this user.');
  }
};




export default NextAuth(authOptions)
