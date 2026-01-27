# Database Initialization Utility

Automatically creates PostgreSQL database if it doesn't exist on first start.

## Features

- ✅ Auto-creates database on first start
- ✅ Checks if database exists before creating
- ✅ Works with environment variables
- ✅ Supports separate admin credentials
- ✅ Can be disabled via environment variable
- ✅ Works with NestJS and plain Node.js

## Installation

```bash
npm install pg
# For TypeScript
npm install --save-dev @types/pg
```

## Usage

### NestJS (Recommended)

1. Import `DatabaseInitModule` in your `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseInitModule } from '@beauty-platform/database-init/nestjs-database-init.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseInitModule, // Add this BEFORE DatabaseModule
    DatabaseModule,    // Your TypeORM module
    // ... other modules
  ],
})
export class AppModule {}
```

2. The database will be created automatically before TypeORM connects.

### Plain Node.js / TypeScript

```typescript
import { initializeDatabaseFromEnv } from '@beauty-platform/database-init/database-init';

// Before connecting to database
await initializeDatabaseFromEnv();

// Now connect to your database
```

### Manual Usage

```typescript
import { DatabaseInitializer } from '@beauty-platform/database-init/database-init';

const initializer = new DatabaseInitializer({
  host: 'db-server-postgres',
  port: 5432,
  user: 'dbadmin',
  password: 'password',
  database: 'auth',
  // Optional: separate admin credentials
  adminUser: 'postgres',
  adminPassword: 'admin-password',
});

await initializer.initialize();
```

## Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `DB_HOST` | Database host | `db-server-postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `dbadmin` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `auth` |
| `DB_ADMIN_USER` | Admin user (optional) | Uses `DB_USER` |
| `DB_ADMIN_PASSWORD` | Admin password (optional) | Uses `DB_PASSWORD` |
| `DB_AUTO_CREATE` | Enable/disable auto-creation | `true` (set to `false` to disable) |

## Disabling Auto-Creation

Set `DB_AUTO_CREATE=false` in your `.env` file to disable automatic database creation.

## Multi-Server Deployment

This utility works seamlessly with multi-server deployments:

```bash
# Server 1
DB_HOST=db-server-1 DB_NAME=auth ./start.sh

# Server 2
DB_HOST=db-server-2 DB_NAME=auth ./start.sh
```

Each server will create its own database if it doesn't exist.

## Error Handling

If database creation fails, the service will log a warning but continue startup. This allows:
- Manual database creation if needed
- Graceful handling of permission issues
- Connection to existing databases

## Best Practices

1. **Use separate admin credentials** for production:
   ```env
   DB_USER=auth_user
   DB_PASSWORD=user_password
   DB_ADMIN_USER=dbadmin
   DB_ADMIN_PASSWORD=admin_password
   ```

2. **Disable in production** if databases are managed separately:
   ```env
   DB_AUTO_CREATE=false
   ```

3. **Test first** on staging with `DB_AUTO_CREATE=true`

4. **Monitor logs** for database creation messages
