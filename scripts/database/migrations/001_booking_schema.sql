-- Booking Context Schema
-- Creates tables for appointments, time slots, master schedules, availability windows

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Appointments table (aggregate root)
CREATE TABLE IF NOT EXISTS booking.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  master_id UUID NOT NULL,
  slot_id UUID NOT NULL,
  service_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'booked',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason VARCHAR(255),
  no_show_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT appointments_status_check CHECK (status IN ('booked', 'confirmed', 'started', 'completed', 'cancelled', 'no_show'))
);

CREATE INDEX idx_appointments_tenant_id ON booking.appointments(tenant_id);
CREATE INDEX idx_appointments_client_id ON booking.appointments(client_id);
CREATE INDEX idx_appointments_master_id ON booking.appointments(master_id);
CREATE INDEX idx_appointments_slot_id ON booking.appointments(slot_id);
CREATE INDEX idx_appointments_starts_at ON booking.appointments(starts_at);
CREATE INDEX idx_appointments_status ON booking.appointments(status);

-- Time Slots table
CREATE TABLE IF NOT EXISTS booking.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  appointment_id UUID REFERENCES booking.appointments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT time_slots_status_check CHECK (status IN ('available', 'booked', 'blocked')),
  CONSTRAINT time_slots_time_check CHECK (ends_at > starts_at)
);

CREATE INDEX idx_time_slots_tenant_id ON booking.time_slots(tenant_id);
CREATE INDEX idx_time_slots_master_id ON booking.time_slots(master_id);
CREATE INDEX idx_time_slots_starts_at ON booking.time_slots(starts_at);
CREATE INDEX idx_time_slots_status ON booking.time_slots(status);
CREATE INDEX idx_time_slots_appointment_id ON booking.time_slots(appointment_id);

-- Master Schedules table
CREATE TABLE IF NOT EXISTS booking.master_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT master_schedules_day_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT master_schedules_time_check CHECK (end_time > start_time)
);

CREATE INDEX idx_master_schedules_tenant_id ON booking.master_schedules(tenant_id);
CREATE INDEX idx_master_schedules_master_id ON booking.master_schedules(master_id);
CREATE INDEX idx_master_schedules_day_of_week ON booking.master_schedules(day_of_week);

-- Availability Windows table (for temporary availability changes)
CREATE TABLE IF NOT EXISTS booking.availability_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_windows_time_check CHECK (ends_at > starts_at)
);

CREATE INDEX idx_availability_windows_tenant_id ON booking.availability_windows(tenant_id);
CREATE INDEX idx_availability_windows_master_id ON booking.availability_windows(master_id);
CREATE INDEX idx_availability_windows_starts_at ON booking.availability_windows(starts_at);

-- Enable Row-Level Security
ALTER TABLE booking.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking.master_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking.availability_windows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY appointments_tenant_select ON booking.appointments
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY appointments_tenant_insert ON booking.appointments
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY appointments_tenant_update ON booking.appointments
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY appointments_tenant_delete ON booking.appointments
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for time_slots
CREATE POLICY time_slots_tenant_select ON booking.time_slots
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY time_slots_tenant_insert ON booking.time_slots
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY time_slots_tenant_update ON booking.time_slots
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY time_slots_tenant_delete ON booking.time_slots
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for master_schedules
CREATE POLICY master_schedules_tenant_select ON booking.master_schedules
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY master_schedules_tenant_insert ON booking.master_schedules
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY master_schedules_tenant_update ON booking.master_schedules
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY master_schedules_tenant_delete ON booking.master_schedules
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for availability_windows
CREATE POLICY availability_windows_tenant_select ON booking.availability_windows
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY availability_windows_tenant_insert ON booking.availability_windows
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY availability_windows_tenant_update ON booking.availability_windows
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY availability_windows_tenant_delete ON booking.availability_windows
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

