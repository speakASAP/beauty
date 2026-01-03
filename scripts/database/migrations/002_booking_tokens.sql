-- Booking Tokens Schema
-- Stores confirmation tokens for public bookings (no authentication required)

-- Booking Tokens table
CREATE TABLE IF NOT EXISTS booking.booking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  appointment_id UUID NOT NULL REFERENCES booking.appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_tokens_tenant_id ON booking.booking_tokens(tenant_id);
CREATE INDEX idx_booking_tokens_token ON booking.booking_tokens(token);
CREATE INDEX idx_booking_tokens_appointment_id ON booking.booking_tokens(appointment_id);
CREATE INDEX idx_booking_tokens_client_id ON booking.booking_tokens(client_id);

-- Enable Row-Level Security
ALTER TABLE booking.booking_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_tokens
CREATE POLICY booking_tokens_tenant_select ON booking.booking_tokens
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY booking_tokens_tenant_insert ON booking.booking_tokens
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY booking_tokens_tenant_update ON booking.booking_tokens
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY booking_tokens_tenant_delete ON booking.booking_tokens
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Function to generate secure token
CREATE OR REPLACE FUNCTION booking.generate_booking_token()
RETURNS VARCHAR(255) AS $$
BEGIN
  -- Generate a secure random token (32 characters, URL-safe)
  RETURN encode(gen_random_bytes(24), 'base64')
    || encode(gen_random_bytes(8), 'base64');
END;
$$ LANGUAGE plpgsql;

