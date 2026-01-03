# Auth Service Database Auto-Creation

This guide explains how to refactor the auth-microservice to automatically create its database on first start.

## Overview

The auth-microservice will now automatically create the `auth` database if it doesn't exist when it starts. This eliminates the need to manually run database creation scripts.

## Implementation

### Step 1: Add Database Initialization Utility

Copy the database initialization utility to auth-microservice:

```bash
# From beauty platform repo
cp -r packages/database-init ~/auth-microservice/shared/database-init
```

Or create it directly in auth-microservice:

```bash
cd ~/auth-microservice
mkdir -p shared/database-init
```

### Step 2: Create Database Initialization Files

Create `shared/database-init/database-init.ts`:

```typescript
import { Client } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  adminUser?: string;
  adminPassword?: string;
}

export class DatabaseInitializer {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = {
      adminUser: config.user,
      adminPassword: config.password,
      ...config,
    };
  }

  async databaseExists(): Promise<boolean> {
    const adminClient = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.adminUser || this.config.user,
      password: this.config.adminPassword || this.config.password,
      database: 'postgres',
    });

    try {
      await adminClient.connect();
      const result = await adminClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [this.config.database]
      );
      await adminClient.end();
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking database existence:', error);
      await adminClient.end().catch(() => {});
      return false;
    }
  }

  async createDatabaseIfNotExists(): Promise<boolean> {
    const exists = await this.databaseExists();
    if (exists) {
      console.log(`Database "${this.config.database}" already exists`);
      return true;
    }

    console.log(`Database "${this.config.database}" does not exist, creating...`);

    const adminClient = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.adminUser || this.config.user,
      password: this.config.adminPassword || this.config.password,
      database: 'postgres',
    });

    try {
      await adminClient.connect();
      await adminClient.query(`CREATE DATABASE "${this.config.database}"`);
      await adminClient.end();
      console.log(`✅ Database "${this.config.database}" created successfully`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to create database "${this.config.database}":`, error.message);
      await adminClient.end().catch(() => {});
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    try {
      return await this.createDatabaseIfNotExists();
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }
}
```

### Step 3: Update DatabaseModule

Update `shared/database/database.module.ts`:

```typescript
/**
 * Database Module for Auth Microservice
 * Now includes automatic database creation on first start
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../src/users/entities/user.entity';
import { PasswordResetToken } from '../../src/auth/entities/password-reset-token.entity';
import { DatabaseInitializer } from '../database-init/database-init';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        // Initialize database before connecting
        if (configService.get('DB_AUTO_CREATE') !== 'false') {
          const initializer = new DatabaseInitializer({
            host: configService.get('DB_HOST') || 'db-server-postgres',
            port: parseInt(configService.get('DB_PORT') || '5432', 10),
            user: configService.get('DB_USER') || 'dbadmin',
            password: configService.get('DB_PASSWORD') || '',
            database: configService.get('DB_NAME') || 'auth',
            adminUser: configService.get('DB_ADMIN_USER') || configService.get('DB_USER') || 'dbadmin',
            adminPassword: configService.get('DB_ADMIN_PASSWORD') || configService.get('DB_PASSWORD') || '',
          });

          await initializer.initialize();
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'db-server-postgres',
          port: parseInt(configService.get('DB_PORT') || '5432', 10),
          username: configService.get('DB_USER') || 'dbadmin',
          password: configService.get('DB_PASSWORD') || '',
          database: configService.get('DB_NAME') || 'auth',
          entities: [User, PasswordResetToken],
          synchronize: configService.get('DB_SYNC') === 'true',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```

### Step 4: Update package.json

Ensure `pg` is installed:

```bash
npm install pg
npm install --save-dev @types/pg
```

### Step 5: Environment Variables

Add optional environment variable to `.env`:

```env
# Database auto-creation (default: true)
# Set to false to disable automatic database creation
DB_AUTO_CREATE=true

# Optional: separate admin credentials for database creation
# If not set, uses DB_USER and DB_PASSWORD
DB_ADMIN_USER=dbadmin
DB_ADMIN_PASSWORD=admin_password
```

## Usage

### Automatic (Default)

The database will be created automatically on first start:

```bash
# Start auth-microservice
npm run start:prod

# Database will be created if it doesn't exist
```

### Disable Auto-Creation

If you prefer to manage databases manually:

```env
DB_AUTO_CREATE=false
```

## Benefits

1. **Zero-configuration deployment** - Database created automatically
2. **Multi-server ready** - Works with different servers/domains
3. **Environment-aware** - Uses environment variables
4. **Safe** - Only creates if database doesn't exist
5. **Optional** - Can be disabled if needed

## Testing

1. **Delete the database** (if it exists):
   ```bash
   docker exec db-server-postgres psql -U dbadmin -d postgres -c "DROP DATABASE IF EXISTS auth;"
   ```

2. **Start auth-microservice**:
   ```bash
   npm run start:prod
   ```

3. **Verify database was created**:
   ```bash
   docker exec db-server-postgres psql -U dbadmin -d postgres -c "\l" | grep auth
   ```

## Multi-Server Deployment

This works seamlessly across different servers:

```bash
# Server 1
DB_HOST=db-server-1 DB_NAME=auth npm start

# Server 2  
DB_HOST=db-server-2 DB_NAME=auth npm start
```

Each server will create its own database if needed.

## Troubleshooting

### Database creation fails

- Check database server is running
- Verify admin credentials are correct
- Check network connectivity
- Review logs for specific error messages

### Permission errors

- Ensure `DB_USER` or `DB_ADMIN_USER` has CREATE DATABASE permission
- Use `DB_ADMIN_USER` with elevated permissions if needed

### Connection errors

- Verify `DB_HOST` is correct (container name or IP)
- Check Docker network connectivity
- Ensure database server is accessible
