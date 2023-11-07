import { PrismaClient } from '@prisma/client';

if (!global.xyz_prisma) {
  global.xyz_prisma = new PrismaClient();
}

export function withPrisma(handler) {
    return async (req, res) => {
        return handler(req, res, global.xyz_prisma);
    };
}
