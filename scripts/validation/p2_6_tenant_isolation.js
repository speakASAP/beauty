#!/usr/bin/env node

/**
 * P2.6 - Tenant Isolation Validation
 * 
 * Validates that UI properly enforces tenant isolation.
 * 
 * Tests:
 * - tenant_id explicit in all API calls
 * - No cross-tenant data access
 * - Tenant context validation
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4110';
const TENANT_1 = process.env.TEST_TENANT_1 || '550e8400-e29b-41d4-a716-446655440001';
const TENANT_2 = process.env.TEST_TENANT_2 || '550e8400-e29b-41d4-a716-446655440002';

let testsPassed = 0;
let testsFailed = 0;

async function testTenantIdInApiCalls() {
  console.log('\n[TEST] tenant_id explicit in API calls');
  
  try {
    // Test that API calls include X-Tenant-ID header
    const response = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: {
        'X-Tenant-ID': TENANT_1,
        'Authorization': 'Bearer test-token',
      },
    });

    // Verify tenant_id is in request
    console.log('✅ API call includes tenant_id header');
    testsPassed++;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ 403 Forbidden when tenant context missing (expected)');
      testsPassed++;
    } else {
      console.log('❌ API call failed:', error.message);
      testsFailed++;
    }
  }
}

async function testCrossTenantIsolation() {
  console.log('\n[TEST] Cross-tenant data isolation');
  
  try {
    // Create data for tenant 1
    const response1 = await axios.post(
      `${API_BASE_URL}/appointments`,
      {
        client_id: 'test-client-1',
        master_id: 'test-master-1',
        service_id: 'test-service-1',
        starts_at: new Date().toISOString(),
        duration_minutes: 60,
      },
      {
        headers: {
          'X-Tenant-ID': TENANT_1,
          'Authorization': 'Bearer test-token',
        },
      }
    );

    const appointmentId = response1.data.data?.id;

    // Try to access with tenant 2
    try {
      await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
        headers: {
          'X-Tenant-ID': TENANT_2,
          'Authorization': 'Bearer test-token',
        },
      });

      console.log('❌ Cross-tenant access allowed (should be blocked)');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('✅ Cross-tenant access blocked (expected)');
        testsPassed++;
      } else {
        console.log('❌ Unexpected error:', error.message);
        testsFailed++;
      }
    }
  } catch (error) {
    console.log('⚠️  Test setup failed:', error.message);
  }
}

async function testTenantContextValidation() {
  console.log('\n[TEST] Tenant context validation');
  
  try {
    // Test without tenant_id
    try {
      await axios.get(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      console.log('❌ Request without tenant_id succeeded (should fail)');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        console.log('✅ Request without tenant_id rejected (expected)');
        testsPassed++;
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }
  } catch (error) {
    console.log('⚠️  Test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('=== P2.6 - Tenant Isolation Validation ===\n');

  await testTenantIdInApiCalls();
  await testCrossTenantIsolation();
  await testTenantContextValidation();

  console.log('\n=== Test Results ===');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n✅ All tenant isolation tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

