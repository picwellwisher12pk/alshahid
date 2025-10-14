# Setup Guide - Al-Shahid Academy

Complete guide to setting up the authentication system with PostgreSQL and Prisma.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or bun package manager

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

1. Open PostgreSQL command line:
   ```bash
   # Windows
   psql -U postgres

   # macOS/Linux
   sudo -u postgres psql
   ```

2. Create the database:
   ```sql
   CREATE DATABASE alshahid_db;
   ```

3. Exit psql:
   ```
   \q
   ```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/alshahid_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. Generate a secure JWT secret:
   ```bash
   # On macOS/Linux
   openssl rand -base64 32

   # On Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

## Step 4: Install Dependencies

```bash
npm install
# or
bun install
```

## Step 5: Initialize Database with Prisma

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Run database migrations:
   ```bash
   npx prisma db push
   ```

3. (Optional) Open Prisma Studio to view database:
   ```bash
   npx prisma studio
   ```

## Step 6: Seed Database (Create First Admin User)

Create a script to add your first admin user.

**Option A: Using Prisma Studio**
1. Run `npx prisma studio`
2. Open the User table
3. Click "Add record"
4. Fill in:
   - email: your@email.com
   - password: Use bcrypt to hash your password first (see option B)
   - name: Your Name
   - role: ADMIN

**Option B: Using a seed script**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alshahid.com' },
    update: {},
    create: {
      email: 'admin@alshahid.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('Created admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "devDependencies": {
    "ts-node": "^10.9.2"
  }
}
```

Run the seed:
```bash
npx prisma db seed
```

## Step 7: Run the Development Server

```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 8: Test Authentication

1. Navigate to `/login`
2. Use the credentials you created:
   - Email: `admin@alshahid.com`
   - Password: `Admin123!`
3. You should be redirected to `/dashboard`

## API Endpoints

The following API endpoints are now available:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Trial Requests
- `POST /api/trial-requests` - Create trial request (public)
- `GET /api/trial-requests` - Get all trial requests (protected)
- `GET /api/trial-requests/[id]` - Get single trial request (protected)
- `PATCH /api/trial-requests/[id]` - Update trial request (protected)
- `DELETE /api/trial-requests/[id]` - Delete trial request (protected)

### Contact Messages
- `POST /api/contact-messages` - Create contact message (public)
- `GET /api/contact-messages` - Get all contact messages (protected)
- `GET /api/contact-messages/[id]` - Get single contact message (protected)
- `PATCH /api/contact-messages/[id]` - Update contact message (protected)
- `DELETE /api/contact-messages/[id]` - Delete contact message (protected)

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@alshahid.com",
    "password": "Admin123!"
  }'
```

### Get current user:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Create trial request:
```bash
curl -X POST http://localhost:3000/api/trial-requests \
  -H "Content-Type: application/json" \
  -d '{
    "parentName": "John Doe",
    "studentName": "Mohammed Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "course": "Quran Memorization"
  }'
```

### Get all trial requests (authenticated):
```bash
curl -X GET http://localhost:3000/api/trial-requests \
  -b cookies.txt
```

## Troubleshooting

### Database Connection Errors

**Error: `Can't reach database server`**
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure port 5432 is not blocked by firewall

**Error: `Authentication failed`**
- Check username and password in DATABASE_URL
- Verify PostgreSQL user has correct permissions

### Prisma Errors

**Error: `Environment variable not found: DATABASE_URL`**
- Make sure `.env` file exists in project root
- Restart your terminal/IDE after creating `.env`

**Error: `Schema Sync`**
- Run `npx prisma db push` to sync schema with database
- Run `npx prisma generate` to regenerate client

### Authentication Errors

**Error: `Invalid token`**
- Tokens expire after 15 minutes
- Use refresh token endpoint or login again

**Error: `User not found`**
- Make sure you've seeded the database
- Check if user exists in Prisma Studio

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
DATABASE_URL="postgresql://user:password@host:5432/production_db?schema=public"
JWT_SECRET="<very-long-random-secure-string>"
NEXT_PUBLIC_API_URL="https://your-domain.com"
NODE_ENV="production"
```

### Database Migration
```bash
# Run migrations in production
npx prisma migrate deploy
```

### Security Checklist
- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS/SSL in production
- [ ] Set secure cookie options
- [ ] Enable CORS restrictions
- [ ] Add rate limiting
- [ ] Set up database backups
- [ ] Use environment-specific database
- [ ] Enable PostgreSQL SSL connection
- [ ] Rotate JWT secrets periodically

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database (dev)
npx prisma db push

# Create a migration
npx prisma migrate dev --name init

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Format Prisma schema
npx prisma format
```

## Next Steps

1. **Email Verification**: Implement email verification for new users
2. **Password Reset**: Add forgot password functionality
3. **Role-Based Access Control**: Implement more granular permissions
4. **Rate Limiting**: Add API rate limiting for security
5. **Logging**: Implement structured logging
6. **Monitoring**: Set up error tracking (Sentry, etc.)
7. **Testing**: Write unit and integration tests

## Support

For issues or questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- Review Prisma docs: [prisma.io/docs](https://www.prisma.io/docs)
- Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
