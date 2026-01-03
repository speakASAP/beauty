-- Inventory Context Schema
-- Creates tables for inventory items and movements

-- Inventory Items table (aggregate root)
CREATE TABLE IF NOT EXISTS inventory.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'piece',
  reorder_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_items_quantity_check CHECK (quantity >= 0),
  CONSTRAINT inventory_items_reorder_level_check CHECK (reorder_level IS NULL OR reorder_level >= 0)
);

CREATE INDEX idx_inventory_items_tenant_id ON inventory.inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_sku ON inventory.inventory_items(sku);
CREATE INDEX idx_inventory_items_quantity ON inventory.inventory_items(quantity);

-- Inventory Movements table (aggregate root)
CREATE TABLE IF NOT EXISTS inventory.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory.inventory_items(id),
  quantity INTEGER NOT NULL, -- Positive for increase, negative for decrease
  reason VARCHAR(255) NOT NULL,
  visit_id UUID, -- Reference to visit that triggered movement
  audit_id UUID, -- Reference to audit if movement is from audit
  idempotency_key VARCHAR(255),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_movements_quantity_check CHECK (quantity != 0)
);

CREATE INDEX idx_inventory_movements_tenant_id ON inventory.inventory_movements(tenant_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory.inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_visit_id ON inventory.inventory_movements(visit_id);
CREATE INDEX idx_inventory_movements_reason ON inventory.inventory_movements(reason);
CREATE INDEX idx_inventory_movements_idempotency_key ON inventory.inventory_movements(idempotency_key);

-- Stock Levels table (denormalized view of current stock)
CREATE TABLE IF NOT EXISTS inventory.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory.inventory_items(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  last_movement_id UUID REFERENCES inventory.inventory_movements(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, item_id),
  CONSTRAINT stock_levels_quantity_check CHECK (quantity >= 0)
);

CREATE INDEX idx_stock_levels_tenant_id ON inventory.stock_levels(tenant_id);
CREATE INDEX idx_stock_levels_item_id ON inventory.stock_levels(item_id);

-- Audits table (for inventory count verification)
CREATE TABLE IF NOT EXISTS inventory.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  auditor_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT audits_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_audits_tenant_id ON inventory.audits(tenant_id);
CREATE INDEX idx_audits_status ON inventory.audits(status);

-- Enable Row-Level Security
ALTER TABLE inventory.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_items
CREATE POLICY inventory_items_tenant_select ON inventory.inventory_items
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_items_tenant_insert ON inventory.inventory_items
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_items_tenant_update ON inventory.inventory_items
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_items_tenant_delete ON inventory.inventory_items
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for inventory_movements
CREATE POLICY inventory_movements_tenant_select ON inventory.inventory_movements
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY inventory_movements_tenant_insert ON inventory.inventory_movements
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Note: Movements are immutable, so no UPDATE/DELETE policies

-- RLS Policies for stock_levels
CREATE POLICY stock_levels_tenant_select ON inventory.stock_levels
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY stock_levels_tenant_insert ON inventory.stock_levels
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY stock_levels_tenant_update ON inventory.stock_levels
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for audits
CREATE POLICY audits_tenant_select ON inventory.audits
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY audits_tenant_insert ON inventory.audits
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY audits_tenant_update ON inventory.audits
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

