import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} else {
  prisma = new PrismaClient();
}
