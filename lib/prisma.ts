import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbConnectionLogged: boolean | undefined;
};

// Function to parse and log database connection info (only once)
function logDatabaseConnection() {
  if (globalForPrisma.dbConnectionLogged) return;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('⚠️  DATABASE_URL is not set!');
    return;
  }

  try {
    const url = new URL(dbUrl);
    const dbName = url.pathname.replace('/', '');
    const host = url.hostname;
    const port = url.port || (url.protocol === 'postgresql:' ? '5432' : 'unknown');

    // Mask password for security
    const maskedPassword = url.password ? '***' + url.password.slice(-4) : 'none';

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          DATABASE CONNECTION INFO                          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Environment: ${process.env.NODE_ENV?.toUpperCase() || 'UNKNOWN'}`.padEnd(61) + '║');
    console.log(`║ Database:    ${dbName}`.padEnd(61) + '║');
    console.log(`║ Host:        ${host}`.padEnd(61) + '║');
    console.log(`║ Port:        ${port}`.padEnd(61) + '║');
    console.log(`║ User:        ${url.username}`.padEnd(61) + '║');
    console.log(`║ Password:    ${maskedPassword}`.padEnd(61) + '║');
    console.log(`║ Protocol:    ${url.protocol.replace(':', '')}`.padEnd(61) + '║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    globalForPrisma.dbConnectionLogged = true;
  } catch (error) {
    console.error('⚠️  Failed to parse DATABASE_URL:', error);
  }
}

// Log database connection info once
logDatabaseConnection();

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
