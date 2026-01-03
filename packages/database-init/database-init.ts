/**
 * Database Initialization Utility
 * Automatically creates database if it doesn't exist on first start
 * 
 * This utility can be used by any NestJS microservice to ensure
 * the required database exists before connecting.
 */

import { Client } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  adminUser?: string; // Optional admin user (defaults to user)
  adminPassword?: string; // Optional admin password (defaults to password)
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

  /**
   * Check if database exists
   */
  async databaseExists(): Promise<boolean> {
    const adminClient = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.adminUser || this.config.user,
      password: this.config.adminPassword || this.config.password,
      database: 'postgres', // Connect to postgres database to check
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

  /**
   * Create database if it doesn't exist
   */
  async createDatabaseIfNotExists(): Promise<boolean> {
    // Check if database already exists
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
      database: 'postgres', // Connect to postgres database to create
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

  /**
   * Initialize database (check and create if needed)
   * This is the main method to call before connecting
   */
  async initialize(): Promise<boolean> {
    try {
      return await this.createDatabaseIfNotExists();
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }
}

/**
 * Helper function to initialize database from environment variables
 */
export async function initializeDatabaseFromEnv(): Promise<boolean> {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'db-server-postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'dbadmin',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth',
    // Optional: separate admin credentials
    adminUser: process.env.DB_ADMIN_USER || process.env.DB_USER || 'dbadmin',
    adminPassword: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD || '',
  };

  // Skip auto-creation if explicitly disabled
  if (process.env.DB_AUTO_CREATE === 'false') {
    console.log('Database auto-creation is disabled (DB_AUTO_CREATE=false)');
    return true;
  }

  const initializer = new DatabaseInitializer(config);
  return await initializer.initialize();
}
