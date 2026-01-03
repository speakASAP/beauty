#!/bin/bash
# Test public booking endpoints
# Usage: ./public-booking-test.sh <base_url> <tenant_id>

set -e

BASE_URL=${1:-"http://localhost:4110"}
TENANT_ID=${2:-""}

if [ -z "$TENANT_ID" ]; then
  echo "Usage: $0 <base_url> <tenant_id>"
  echo "Example: $0 http://localhost:4110 550e8400-e29b-41d4-a716-446655440001"
  exit 1
fi

echo "Testing public booking endpoints..."
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Test 1: Check availability
echo "1. Testing GET /public/availability..."
AVAILABILITY_RESPONSE=$(curl -s -X GET "$BASE_URL/public/availability?tenant_id=$TENANT_ID&service_id=test-service&date=2024-01-15" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json")

echo "Response: $AVAILABILITY_RESPONSE"
echo ""

# Test 2: Create booking
echo "2. Testing POST /public/bookings..."
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/public/bookings?tenant_id=$TENANT_ID" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "'"$TENANT_ID"'",
    "client_first_name": "Test",
    "client_last_name": "User",
    "client_phone": "+420123456789",
    "client_email": "test@example.com",
    "master_id": "550e8400-e29b-41d4-a716-446655440002",
    "service_id": "550e8400-e29b-41d4-a716-446655440003",
    "starts_at": "2024-01-15T10:00:00Z",
    "duration_minutes": 60,
    "gdpr_consent": true
  }')

echo "Response: $BOOKING_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$BOOKING_RESPONSE" | grep -o '"confirmation_token":"[^"]*' | cut -d'"' -f4)
CONFIRMATION_CODE=$(echo "$BOOKING_RESPONSE" | grep -o '"confirmation_code":"[^"]*' | cut -d'"' -f4)
SMS_SENT=$(echo "$BOOKING_RESPONSE" | grep -o '"sms_sent":[^,}]*' | cut -d':' -f2)

if [ -n "$TOKEN" ]; then
  echo "✅ Booking created successfully"
  echo "   Token: ${TOKEN:0:20}..."
  echo "   Confirmation Code: $CONFIRMATION_CODE"
  echo "   SMS Sent: $SMS_SENT"
  echo ""

  # Test 3: Get booking by token
  echo "3. Testing GET /public/bookings/$TOKEN..."
  LOOKUP_RESPONSE=$(curl -s -X GET "$BASE_URL/public/bookings/$TOKEN?tenant_id=$TENANT_ID" \
    -H "X-Tenant-ID: $TENANT_ID" \
    -H "Content-Type: application/json")
  
  echo "Response: $LOOKUP_RESPONSE"
  echo ""

  # Test 4: Cancel booking
  echo "4. Testing POST /public/bookings/$TOKEN/cancel..."
  CANCEL_RESPONSE=$(curl -s -X POST "$BASE_URL/public/bookings/$TOKEN/cancel?tenant_id=$TENANT_ID" \
    -H "X-Tenant-ID: $TENANT_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "reason": "Test cancellation"
    }')
  
  echo "Response: $CANCEL_RESPONSE"
  echo ""
else
  echo "❌ Failed to create booking or extract token"
  exit 1
fi

echo "✅ All tests completed!"

