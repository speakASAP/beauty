-- POS / Orders Context Schema
-- Creates tables for orders, order items, visits, visit items

-- Orders table (aggregate root)
CREATE TABLE IF NOT EXISTS pos.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  visit_id UUID,
  client_id UUID NOT NULL,
  total_amount BIGINT NOT NULL, -- Amount in smallest unit (cents/haléře)
  vat_amount BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_status_check CHECK (status IN ('open', 'closed', 'cancelled')),
  CONSTRAINT orders_amount_check CHECK (total_amount >= 0),
  CONSTRAINT orders_vat_check CHECK (vat_amount >= 0)
);

CREATE INDEX idx_orders_tenant_id ON pos.orders(tenant_id);
CREATE INDEX idx_orders_visit_id ON pos.orders(visit_id);
CREATE INDEX idx_orders_client_id ON pos.orders(client_id);
CREATE INDEX idx_orders_status ON pos.orders(status);
CREATE INDEX idx_orders_created_at ON pos.orders(created_at);

-- Order Items table
CREATE TABLE IF NOT EXISTS pos.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES pos.orders(id) ON DELETE CASCADE,
  service_id UUID,
  product_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL, -- Price in smallest unit
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00, -- VAT rate in percentage
  vat_amount BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT order_items_service_or_product_check CHECK (
    (service_id IS NOT NULL AND product_id IS NULL) OR
    (service_id IS NULL AND product_id IS NOT NULL)
  ),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_price_check CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_items_tenant_id ON pos.order_items(tenant_id);
CREATE INDEX idx_order_items_order_id ON pos.order_items(order_id);
CREATE INDEX idx_order_items_service_id ON pos.order_items(service_id);
CREATE INDEX idx_order_items_product_id ON pos.order_items(product_id);

-- Visits table (aggregate root)
CREATE TABLE IF NOT EXISTS pos.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  master_id UUID NOT NULL,
  appointment_id UUID, -- Can be null for walk-ins
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  is_walk_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_tenant_id ON pos.visits(tenant_id);
CREATE INDEX idx_visits_client_id ON pos.visits(client_id);
CREATE INDEX idx_visits_master_id ON pos.visits(master_id);
CREATE INDEX idx_visits_appointment_id ON pos.visits(appointment_id);
CREATE INDEX idx_visits_started_at ON pos.visits(started_at);

-- Visit Items table
CREATE TABLE IF NOT EXISTS pos.visit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  visit_id UUID NOT NULL REFERENCES pos.visits(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT visit_items_quantity_check CHECK (quantity > 0)
);

CREATE INDEX idx_visit_items_tenant_id ON pos.visit_items(tenant_id);
CREATE INDEX idx_visit_items_visit_id ON pos.visit_items(visit_id);
CREATE INDEX idx_visit_items_service_id ON pos.visit_items(service_id);

-- Enable Row-Level Security
ALTER TABLE pos.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.visit_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY orders_tenant_select ON pos.orders
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY orders_tenant_insert ON pos.orders
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY orders_tenant_update ON pos.orders
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY orders_tenant_delete ON pos.orders
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for order_items
CREATE POLICY order_items_tenant_select ON pos.order_items
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY order_items_tenant_insert ON pos.order_items
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY order_items_tenant_update ON pos.order_items
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY order_items_tenant_delete ON pos.order_items
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for visits
CREATE POLICY visits_tenant_select ON pos.visits
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visits_tenant_insert ON pos.visits
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visits_tenant_update ON pos.visits
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visits_tenant_delete ON pos.visits
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for visit_items
CREATE POLICY visit_items_tenant_select ON pos.visit_items
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visit_items_tenant_insert ON pos.visit_items
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visit_items_tenant_update ON pos.visit_items
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY visit_items_tenant_delete ON pos.visit_items
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

