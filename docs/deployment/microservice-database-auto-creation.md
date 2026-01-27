# Microservice Database Auto-Creation Pattern

This document describes the pattern for adding automatic database creation to NestJS microservices.

## Overview

All microservices should automatically create their required database on first start if it doesn't exist. This eliminates manual database setup steps and ensures consistent deployment across different servers and domains.

## Implementation Pattern

### Step 1: Create Database Initialization Utility

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

### Step 2: Update DatabaseModule

Update `shared/database/database.module.ts` to use `forRootAsync` and initialize database:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { YourEntity } from '../../src/your-module/entities/your-entity.entity';
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
            database: configService.get('DB_NAME') || 'your-service-name',
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
          database: configService.get('DB_NAME') || 'your-service-name',
          entities: [YourEntity],
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

### Step 3: Update .env File

Add to `.env`:

```env
# Database Auto-Creation (enabled by default)
# Database will be created automatically on first start if it doesn't exist
# Set to false to disable: DB_AUTO_CREATE=false
DB_AUTO_CREATE=true

# Database Admin Credentials (optional)
# If DB_USER doesn't have CREATE DATABASE permission, uncomment and set these:
# DB_ADMIN_USER=dbadmin
# DB_ADMIN_PASSWORD=your_admin_password_here
```

### Step 4: Ensure ConfigModule is Imported

Make sure `ConfigModule` is imported in your `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Environment Variables

| Variable | Description | Default | Required |
| -------- | ----------- | ------- | -------- |
| `DB_AUTO_CREATE` | Enable auto-creation | `true` | No |
| `DB_HOST` | Database host | `db-server-postgres` | No |
| `DB_PORT` | Database port | `5432` | No |
| `DB_USER` | Database user | `dbadmin` | No |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | Service name | No |
| `DB_ADMIN_USER` | Admin user (optional) | Uses `DB_USER` | No |
| `DB_ADMIN_PASSWORD` | Admin password (optional) | Uses `DB_PASSWORD` | No |

## Multi-Server Deployment

This pattern works seamlessly across different servers:

```bash
# Server 1
DB_HOST=db-server-1 DB_NAME=notifications npm start

# Server 2
DB_HOST=db-server-2 DB_NAME=notifications npm start
```

Each server will create its own database if needed.

## Services Using This Pattern

- ✅ auth-microservice
- ✅ notifications-microservice

## Benefits

1. **Zero-configuration deployment** - Database created automatically
2. **Multi-server ready** - Works with different servers/domains
3. **Environment-aware** - Uses environment variables
4. **Safe** - Only creates if database doesn't exist
5. **Optional** - Can be disabled if needed

## Testing

1. **Delete the database** (if it exists):
   ```bash
   docker exec db-server-postgres psql -U dbadmin -d postgres -c "DROP DATABASE IF EXISTS your_db_name;"
   ```

2. **Start the microservice**:
   ```bash
   npm run start:prod
   ```

3. **Verify database was created**:
   ```bash
   docker exec db-server-postgres psql -U dbadmin -d postgres -c "\l" | grep your_db_name
   ```

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
