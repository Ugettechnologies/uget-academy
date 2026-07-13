import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient;
  pool?: any;
  adapter?: any;
};

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 5, // Keep the pool small to avoid exhausting Neon tier limits
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  
  if (!globalForPrisma.adapter) {
    globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter: globalForPrisma.adapter });
  }
  
  prisma = globalForPrisma.prisma;
} else {
  prisma = new PrismaClient();
}
