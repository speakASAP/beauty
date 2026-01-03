-- Beauty Franchise Platform - Database Initialization
-- This script sets up the database with schemas and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas for each bounded context
CREATE SCHEMA IF NOT EXISTS booking;
CREATE SCHEMA IF NOT EXISTS pos;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS customer;
CREATE SCHEMA IF NOT EXISTS staff;
CREATE SCHEMA IF NOT EXISTS bi;
CREATE SCHEMA IF NOT EXISTS integrations;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS platform;

-- Enable Row-Level Security on all schemas (will be enabled per table)
-- RLS policies will be created per table during service initialization

-- Create tenants table (platform schema)
CREATE TABLE IF NOT EXISTS platform.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  state VARCHAR(20) NOT NULL DEFAULT 'CREATING',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT tenants_state_check CHECK (state IN ('CREATING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_tenants_state ON platform.tenants(state);

-- Create franchisor audit log table (for compliance)
CREATE TABLE IF NOT EXISTS platform.franchisor_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  tenant_id_accessed UUID[],
  query TEXT,
  result_count INTEGER,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_franchisor_audit_log_user_id ON platform.franchisor_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_franchisor_audit_log_occurred_at ON platform.franchisor_audit_log(occurred_at);

-- Grant permissions (will be refined per service)
GRANT USAGE ON SCHEMA booking TO beauty_user;
GRANT USAGE ON SCHEMA pos TO beauty_user;
GRANT USAGE ON SCHEMA payments TO beauty_user;
GRANT USAGE ON SCHEMA inventory TO beauty_user;
GRANT USAGE ON SCHEMA customer TO beauty_user;
GRANT USAGE ON SCHEMA staff TO beauty_user;
GRANT USAGE ON SCHEMA bi TO beauty_user;
GRANT USAGE ON SCHEMA integrations TO beauty_user;
GRANT USAGE ON SCHEMA catalog TO beauty_user;
GRANT USAGE ON SCHEMA platform TO beauty_user;

-- Database Session Variables Configuration
-- PostgreSQL custom variables (app.tenant_id, app.is_franchisor) are set dynamically
-- by the application layer before each query. These variables are used by RLS policies
-- to enforce tenant isolation. No explicit creation is needed - PostgreSQL allows
-- setting custom variables via SET command.
--
-- Usage in application:
--   SET app.tenant_id = 'uuid-value';
--   SET app.is_franchisor = true|false;
--
-- RLS policies reference these via:
--   current_setting('app.tenant_id')::uuid
--   current_setting('app.is_franchisor')::boolean

-- Note: Individual tables and RLS policies will be created by migration scripts
-- Run migrations in order:
-- 001_booking_schema.sql
-- 002_pos_schema.sql
-- 003_payments_schema.sql
-- 004_customer_schema.sql
-- 005_inventory_schema.sql
-- 006_bi_schema.sql
-- 007_staff_schema.sql

