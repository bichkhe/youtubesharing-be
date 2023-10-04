
import { Prisma, PrismaClient, VoteKind } from '@prisma/client'
const prisma = new PrismaClient()
export { prisma, VoteKind };
