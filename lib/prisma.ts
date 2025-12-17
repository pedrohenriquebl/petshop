import * as Prisma from '@prisma/client';

const { PrismaClient } = Prisma as any;

export const prisma = new PrismaClient();
