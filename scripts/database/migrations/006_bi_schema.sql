-- BI Context Schema
-- Creates aggregated tables for analytics and reporting
-- All tables are read-only (updated only via event subscribers)

-- Daily Sales by Tenant (aggregated from order.created and payment.received)
CREATE TABLE IF NOT EXISTS bi.daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  sale_date DATE NOT NULL,
  total_amount BIGINT NOT NULL DEFAULT 0, -- Amount in smallest unit (cents/haléře)
  total_vat_amount BIGINT NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  payment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sale_date),
  CONSTRAINT daily_sales_amount_check CHECK (total_amount >= 0),
  CONSTRAINT daily_sales_vat_check CHECK (total_vat_amount >= 0),
  CONSTRAINT daily_sales_order_count_check CHECK (order_count >= 0),
  CONSTRAINT daily_sales_payment_count_check CHECK (payment_count >= 0)
);

CREATE INDEX idx_daily_sales_tenant_id ON bi.daily_sales(tenant_id);
CREATE INDEX idx_daily_sales_sale_date ON bi.daily_sales(sale_date);
CREATE INDEX idx_daily_sales_tenant_date ON bi.daily_sales(tenant_id, sale_date);

-- Master Utilization (aggregated from appointment.completed)
CREATE TABLE IF NOT EXISTS bi.master_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_id UUID NOT NULL,
  utilization_date DATE NOT NULL,
  appointments_completed INTEGER NOT NULL DEFAULT 0,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  utilization_percentage DECIMAL(5,2) DEFAULT 0.00, -- Percentage of working time utilized
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, master_id, utilization_date),
  CONSTRAINT master_utilization_appointments_check CHECK (appointments_completed >= 0),
  CONSTRAINT master_utilization_duration_check CHECK (total_duration_minutes >= 0),
  CONSTRAINT master_utilization_percentage_check CHECK (utilization_percentage >= 0 AND utilization_percentage <= 100)
);

CREATE INDEX idx_master_utilization_tenant_id ON bi.master_utilization(tenant_id);
CREATE INDEX idx_master_utilization_master_id ON bi.master_utilization(master_id);
CREATE INDEX idx_master_utilization_date ON bi.master_utilization(utilization_date);
CREATE INDEX idx_master_utilization_tenant_master_date ON bi.master_utilization(tenant_id, master_id, utilization_date);

-- Client LTV (Lifetime Value) - aggregated from client.visit_recorded and payment.received
CREATE TABLE IF NOT EXISTS bi.client_ltv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0, -- Amount in smallest unit
  first_visit_date DATE,
  last_visit_date DATE,
  average_visit_value BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, client_id),
  CONSTRAINT client_ltv_visits_check CHECK (total_visits >= 0),
  CONSTRAINT client_ltv_spent_check CHECK (total_spent >= 0),
  CONSTRAINT client_ltv_avg_check CHECK (average_visit_value >= 0)
);

CREATE INDEX idx_client_ltv_tenant_id ON bi.client_ltv(tenant_id);
CREATE INDEX idx_client_ltv_client_id ON bi.client_ltv(client_id);
CREATE INDEX idx_client_ltv_total_spent ON bi.client_ltv(total_spent DESC);

-- Inventory Usage (aggregated from inventory.decreased)
CREATE TABLE IF NOT EXISTS bi.inventory_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL,
  usage_date DATE NOT NULL,
  quantity_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, item_id, usage_date),
  CONSTRAINT inventory_usage_quantity_check CHECK (quantity_used >= 0)
);

CREATE INDEX idx_inventory_usage_tenant_id ON bi.inventory_usage(tenant_id);
CREATE INDEX idx_inventory_usage_item_id ON bi.inventory_usage(item_id);
CREATE INDEX idx_inventory_usage_date ON bi.inventory_usage(usage_date);
CREATE INDEX idx_inventory_usage_tenant_item_date ON bi.inventory_usage(tenant_id, item_id, usage_date);

-- Appointment Aggregates (aggregated from appointment.* events)
CREATE TABLE IF NOT EXISTS bi.appointment_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  appointment_date DATE NOT NULL,
  appointments_booked INTEGER NOT NULL DEFAULT 0,
  appointments_completed INTEGER NOT NULL DEFAULT 0,
  appointments_cancelled INTEGER NOT NULL DEFAULT 0,
  appointments_no_show INTEGER NOT NULL DEFAULT 0,
  cancellation_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
  no_show_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, appointment_date),
  CONSTRAINT appointment_aggregates_booked_check CHECK (appointments_booked >= 0),
  CONSTRAINT appointment_aggregates_completed_check CHECK (appointments_completed >= 0),
  CONSTRAINT appointment_aggregates_cancelled_check CHECK (appointments_cancelled >= 0),
  CONSTRAINT appointment_aggregates_no_show_check CHECK (appointments_no_show >= 0),
  CONSTRAINT appointment_aggregates_cancellation_rate_check CHECK (cancellation_rate >= 0 AND cancellation_rate <= 100),
  CONSTRAINT appointment_aggregates_no_show_rate_check CHECK (no_show_rate >= 0 AND no_show_rate <= 100)
);

CREATE INDEX idx_appointment_aggregates_tenant_id ON bi.appointment_aggregates(tenant_id);
CREATE INDEX idx_appointment_aggregates_date ON bi.appointment_aggregates(appointment_date);
CREATE INDEX idx_appointment_aggregates_tenant_date ON bi.appointment_aggregates(tenant_id, appointment_date);

-- Event Processing Log (for idempotency and tracking)
CREATE TABLE IF NOT EXISTS bi.event_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  tenant_id UUID NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_processing_log_event_id ON bi.event_processing_log(event_id);
CREATE INDEX idx_event_processing_log_tenant_id ON bi.event_processing_log(tenant_id);
CREATE INDEX idx_event_processing_log_event_type ON bi.event_processing_log(event_type);
CREATE INDEX idx_event_processing_log_processed_at ON bi.event_processing_log(processed_at);

-- Enable Row-Level Security
ALTER TABLE bi.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi.master_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi.client_ltv ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi.inventory_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi.appointment_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi.event_processing_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_sales
CREATE POLICY daily_sales_tenant_select ON bi.daily_sales
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY daily_sales_tenant_insert ON bi.daily_sales
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY daily_sales_tenant_update ON bi.daily_sales
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for master_utilization
CREATE POLICY master_utilization_tenant_select ON bi.master_utilization
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY master_utilization_tenant_insert ON bi.master_utilization
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY master_utilization_tenant_update ON bi.master_utilization
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for client_ltv
CREATE POLICY client_ltv_tenant_select ON bi.client_ltv
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_ltv_tenant_insert ON bi.client_ltv
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY client_ltv_tenant_update ON bi.client_ltv
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for inventory_usage
CREATE POLICY inventory_usage_tenant_select ON bi.inventory_usage
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_usage_tenant_insert ON bi.inventory_usage
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_usage_tenant_update ON bi.inventory_usage
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for appointment_aggregates
CREATE POLICY appointment_aggregates_tenant_select ON bi.appointment_aggregates
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY appointment_aggregates_tenant_insert ON bi.appointment_aggregates
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY appointment_aggregates_tenant_update ON bi.appointment_aggregates
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for event_processing_log
CREATE POLICY event_processing_log_tenant_select ON bi.event_processing_log
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY event_processing_log_tenant_insert ON bi.event_processing_log
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Note: event_processing_log is append-only (no UPDATE/DELETE)

