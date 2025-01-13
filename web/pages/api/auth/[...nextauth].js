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
import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Role } from '@prisma/client';
import { getPrisma } from '@/middleware/withPrisma';

const prisma = getPrisma();

const prismaAdapter = PrismaAdapter(prisma);

const MyAdapter = {
  ...prismaAdapter,
  linkAccount: (account) => {
    account['not_before_policy'] = account['not-before-policy'];
    delete account['not-before-policy'];
    return prismaAdapter.linkAccount(account);
  },
  deleteSession: async (sessionToken) => {
    try {
      await prisma.session.delete({
        where: { sessionToken },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return; // Ignore if the session doesn't exist
      }
      throw error; // Rethrow any other error
    }
  },
};

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
        },
      }),
    },
  },
  idToken: true,
  checks: ['pkce', 'state'],
  profile(OAuthProfile) {
    console.log("OAuthProfile", OAuthProfile)
    return {
      id: OAuthProfile.sub,
      name: OAuthProfile.name,
      email: OAuthProfile.email,
      image: OAuthProfile.picture,
      roles: [Role.STUDENT],
      affiliations: OAuthProfile.swissEduIDLinkedAffiliationMail,
      organizations: OAuthProfile.swissEduIDLinkedAffiliationMail.map(
        (affiliation) => affiliation.split('@')[1],
      ),
      selectedAffiliation: null,
    };
  },
};

const keycloakProvider = KeycloakProvider({
  clientId: process.env.NEXTAUTH_KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.NEXTAUTH_KEYCLOAK_CLIENT_SECRET,
  issuer: process.env.NEXTAUTH_KEYCLOAK_ISSUER_BASE_URL,
  authorization: {
    params: {
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/keycloak`,
    },
  },
});

async function handleSingleSessionPerUser(user) {
  try {
    const activeSessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    if (activeSessions.length > 0) {
      // Delete all active sessions for the user
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }
  } catch (error) {
    console.error("Error in handleSingleSessionPerUser:", error);
    throw new Error("Unable to handle single session enforcement");
  }
}


async function handleKeycloakToSwitchMerge(keycloakUser, profile) {
  const switchUser = await prisma.user.findFirst({
    where: {
      affiliations: {
        has: keycloakUser.email, // Check if Keycloak email exists in affiliations
      },
    },
  });

  if (switchUser) {
    console.log(`Found existing SWITCH edu-ID user for Keycloak email: ${keycloakUser.email}`);

    // Copy group memberships from the SWITCH user to the Keycloak user
    await prisma.userOnGroup.updateMany({
      where: { userId: switchUser.id },
      data: { userId: keycloakUser.id },
    });
    console.log(`Copied group memberships from SWITCH user ${switchUser.id} to Keycloak user ${keycloakUser.id}`);
  } else {
    console.log(`No existing SWITCH edu-ID user found for Keycloak email: ${keycloakUser.email}`);
  }
}

async function switchMigrateAffiliatedUsers(oauthUser, dbUser) {
  console.log('switchMigrateAffiliatedUsers', oauthUser);
  if (oauthUser.affiliations && oauthUser.affiliations.length > 0) {
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
          dbUser.email,
        );

        if (existingAffiliatedUser.roles.includes(Role.PROFESSOR)) {
          const currentRoles = dbUser.roles || [];
          if (!currentRoles.includes(Role.PROFESSOR)) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                roles: {
                  set: [...currentRoles, Role.PROFESSOR],
                },
              },
            });
            console.log(`Assigned PROFESSOR role to user: ${dbUser.id}`);
          }

          await prisma.userOnGroup.updateMany({
            where: { userId: existingAffiliatedUser.id },
            data: { userId: dbUser.id },
          });
        }
      }
    }
  } else {
    console.log('No affiliations found for this user.');
  }
}

export const authOptions = {
  adapter: MyAdapter,
  providers: [switchEduId, keycloakProvider],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user = user;
        session.user.id = user.id;
        session.user.roles = user.roles;

        const userWithExtras = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
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
        });

        if (userWithExtras) {
          let organizations = userWithExtras.organizations;

          if (!organizations || organizations.length === 0) {
            const org = user.email.split('@')[1];
            const updatedUser = await prisma.user.update({
              where: { email: user.email },
              data: {
                affiliations: [user.email],
                organizations: [org],
                selectedOrganization: org,
              },
            });

            organizations = updatedUser.organizations;
          }

          if (
            user.selectedOrganization &&
            !organizations.includes(user.selectedOrganization)
          ) {
            session.user.selectedOrganization = null;

            await prisma.user.update({
              where: { email: user.email },
              data: {
                selectedOrganization: null,
              },
            });
          }

          session.user.groups = userWithExtras.groups
            .filter((g) => g.group.organization === user.selectedOrganization)
            .map((g) => g.group.scope);

          session.user.selected_group = userWithExtras.groups.find(
            (g) => g.selected,
          )?.group.scope;
        }
      }

      return session;
    },

    async signIn({ user: oauthUser, account, profile }) {
      await handleSingleSessionPerUser(oauthUser);

      let dbUser;
      await prisma.$transaction(async (prisma) => {
        dbUser = await prisma.user.findUnique({
          where: { email: oauthUser.email },
        });

        if (dbUser) {
          if (account.provider === 'switch') {
            const oldOrganizations = dbUser.organizations || [];
            const newOrganizations = oauthUser.affiliations.map(
              (affiliation) => affiliation.split('@')[1],
            );

            await prisma.user.update({
              where: { email: oauthUser.email },
              data: {
                name: profile.name,
                image: oauthUser.image,
                affiliations: oauthUser.affiliations,
                organizations: newOrganizations,
              },
            });

            const removedOrganizations = oldOrganizations.filter(
              (org) => !newOrganizations.includes(org),
            );

            if (removedOrganizations.length > 0) {
              await prisma.userOnGroup.deleteMany({
                where: {
                  userId: dbUser.id,
                  group: {
                    organization: { in: removedOrganizations },
                  },
                },
              });
            }
          }
        } else {
          const affiliations = oauthUser.affiliations || [oauthUser.email];
          const organizations = affiliations.map(
            (affiliation) => affiliation.split('@')[1],
          );

          dbUser = await prisma.user.create({
            data: {
              email: oauthUser.email,
              name: profile.name,
              roles: [Role.STUDENT],
              image: oauthUser.image,
              affiliations: affiliations,
              organizations: organizations,
            },
          });
        }

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
            },
          });
        }
      });

      if (account.provider === 'keycloak') {
        await handleKeycloakToSwitchMerge(oauthUser, profile);
      }

      if (account.provider === 'switch') {
        await switchMigrateAffiliatedUsers(oauthUser, dbUser);
      }

      return true;
    },
  },
};

export default NextAuth(authOptions);
