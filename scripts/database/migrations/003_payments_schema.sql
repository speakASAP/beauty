-- Payments Context Schema
-- Creates tables for payments and payment transactions

-- Payments table (aggregate root)
CREATE TABLE IF NOT EXISTS payments.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL,
  amount BIGINT NOT NULL, -- Amount in smallest unit (cents/haléře)
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  captured_at TIMESTAMP WITH TIME ZONE,
  idempotency_key VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_method_check CHECK (method IN ('card', 'cash', 'online', 'bank_transfer')),
  CONSTRAINT payments_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
  CONSTRAINT payments_amount_check CHECK (amount > 0)
);

CREATE INDEX idx_payments_tenant_id ON payments.payments(tenant_id);
CREATE INDEX idx_payments_order_id ON payments.payments(order_id);
CREATE INDEX idx_payments_status ON payments.payments(status);
CREATE INDEX idx_payments_idempotency_key ON payments.payments(idempotency_key);

-- Payment Transactions table (for tracking payment attempts)
CREATE TABLE IF NOT EXISTS payments.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments.payments(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255), -- External transaction ID
  status VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  error_message TEXT,
  CONSTRAINT payment_transactions_status_check CHECK (status IN ('initiated', 'completed', 'failed'))
);

CREATE INDEX idx_payment_transactions_tenant_id ON payments.payment_transactions(tenant_id);
CREATE INDEX idx_payment_transactions_payment_id ON payments.payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_transaction_id ON payments.payment_transactions(transaction_id);

-- Refunds table
CREATE TABLE IF NOT EXISTS payments.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments.payments(id),
  amount BIGINT NOT NULL,
  refunded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  idempotency_key VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT refunds_amount_check CHECK (amount > 0)
);

CREATE INDEX idx_refunds_tenant_id ON payments.refunds(tenant_id);
CREATE INDEX idx_refunds_payment_id ON payments.refunds(payment_id);
CREATE INDEX idx_refunds_idempotency_key ON payments.refunds(idempotency_key);

-- Enable Row-Level Security
ALTER TABLE payments.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY payments_tenant_select ON payments.payments
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY payments_tenant_insert ON payments.payments
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY payments_tenant_update ON payments.payments
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY payments_tenant_delete ON payments.payments
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for payment_transactions
CREATE POLICY payment_transactions_tenant_select ON payments.payment_transactions
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY payment_transactions_tenant_insert ON payments.payment_transactions
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY payment_transactions_tenant_update ON payments.payment_transactions
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for refunds
CREATE POLICY refunds_tenant_select ON payments.refunds
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY refunds_tenant_insert ON payments.refunds
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY refunds_tenant_update ON payments.refunds
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

