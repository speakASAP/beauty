/**
 * Updated Database Module for Auth Microservice
 * Includes automatic database creation on first start
 * 
 * Replace shared/database/database.module.ts with this version
 */

import { Module } from '@nestjs/common';
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
