require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

try {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const p = new PrismaClient({ adapter });
  console.log('SUCCESS: Instantiated with PostgreSQL adapter');
} catch (e) {
  console.log('FAILED with PostgreSQL adapter:', e.message);
}
