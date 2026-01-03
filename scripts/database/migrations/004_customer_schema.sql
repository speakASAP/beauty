-- Customer Context Schema
-- Creates tables for clients, GDPR consents, preferences, visit history

-- Clients table (aggregate root)
CREATE TABLE IF NOT EXISTS customer.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT clients_phone_or_email_check CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_clients_tenant_id ON customer.clients(tenant_id);
CREATE INDEX idx_clients_phone ON customer.clients(phone);
CREATE INDEX idx_clients_email ON customer.clients(email);
CREATE INDEX idx_clients_name ON customer.clients(last_name, first_name);

-- Client Consents table (GDPR)
CREATE TABLE IF NOT EXISTS customer.client_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES customer.clients(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT client_consents_type_check CHECK (consent_type IN ('gdpr', 'marketing', 'sms', 'email'))
);

CREATE INDEX idx_client_consents_tenant_id ON customer.client_consents(tenant_id);
CREATE INDEX idx_client_consents_client_id ON customer.client_consents(client_id);
CREATE INDEX idx_client_consents_granted ON customer.client_consents(granted);

-- Client Preferences table
CREATE TABLE IF NOT EXISTS customer.client_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES customer.clients(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, preference_key)
);

CREATE INDEX idx_client_preferences_tenant_id ON customer.client_preferences(tenant_id);
CREATE INDEX idx_client_preferences_client_id ON customer.client_preferences(client_id);

-- Client Visit History table (read-only aggregate from events)
CREATE TABLE IF NOT EXISTS customer.client_visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES customer.clients(id) ON DELETE CASCADE,
  visit_id UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount BIGINT NOT NULL,
  services_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT client_visit_history_amount_check CHECK (total_amount >= 0),
  CONSTRAINT client_visit_history_services_check CHECK (services_count >= 0)
);

CREATE INDEX idx_client_visit_history_tenant_id ON customer.client_visit_history(tenant_id);
CREATE INDEX idx_client_visit_history_client_id ON customer.client_visit_history(client_id);
CREATE INDEX idx_client_visit_history_visit_date ON customer.client_visit_history(visit_date);

-- Enable Row-Level Security
ALTER TABLE customer.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer.client_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer.client_visit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY clients_tenant_select ON customer.clients
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY clients_tenant_insert ON customer.clients
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY clients_tenant_update ON customer.clients
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY clients_tenant_delete ON customer.clients
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for client_consents
CREATE POLICY client_consents_tenant_select ON customer.client_consents
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_consents_tenant_insert ON customer.client_consents
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_consents_tenant_update ON customer.client_consents
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for client_preferences
CREATE POLICY client_preferences_tenant_select ON customer.client_preferences
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_preferences_tenant_insert ON customer.client_preferences
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_preferences_tenant_update ON customer.client_preferences
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_preferences_tenant_delete ON customer.client_preferences
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for client_visit_history
CREATE POLICY client_visit_history_tenant_select ON customer.client_visit_history
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_visit_history_tenant_insert ON customer.client_visit_history
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Note: visit_history is read-only (updated only via events), so no UPDATE/DELETE policies

