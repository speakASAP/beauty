/**
 * NestJS Database Initialization Module
 * 
 * Import this module in your AppModule to enable automatic database creation
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseInitService } from './nestjs-database-init.service';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseInitService],
  exports: [DatabaseInitService],
})
export class DatabaseInitModule {}
