/**
 * NestJS Database Initialization Service
 * Automatically creates database if it doesn't exist on first start
 * 
 * Usage in NestJS:
 * 1. Import DatabaseInitModule in your AppModule
 * 2. The database will be created automatically before TypeORM connects
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseInitializer, DatabaseConfig } from './database-init';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Skip auto-creation if explicitly disabled
    if (this.configService.get('DB_AUTO_CREATE') === 'false') {
      this.logger.log('Database auto-creation is disabled (DB_AUTO_CREATE=false)');
      return;
    }

    const config: DatabaseConfig = {
      host: this.configService.get('DB_HOST') || 'db-server-postgres',
      port: parseInt(this.configService.get('DB_PORT') || '5432', 10),
      user: this.configService.get('DB_USER') || 'dbadmin',
      password: this.configService.get('DB_PASSWORD') || '',
      database: this.configService.get('DB_NAME') || 'auth',
      // Optional: separate admin credentials
      adminUser: this.configService.get('DB_ADMIN_USER') || this.configService.get('DB_USER') || 'dbadmin',
      adminPassword: this.configService.get('DB_ADMIN_PASSWORD') || this.configService.get('DB_PASSWORD') || '',
    };

    this.logger.log(`Initializing database: ${config.database} on ${config.host}:${config.port}`);

    const initializer = new DatabaseInitializer(config);
    const success = await initializer.initialize();

    if (!success) {
      this.logger.warn('Database initialization failed, but continuing startup...');
      this.logger.warn('Make sure the database exists or create it manually');
    }
  }
}
