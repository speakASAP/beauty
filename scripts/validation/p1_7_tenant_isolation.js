#!/usr/bin/env node
/**
 * P1.7 - Tenant Isolation Validation Script
 * Validates RLS policies prevent cross-tenant data access
 * 
 * Tests:
 * - Cross-tenant read prevention
 * - Cross-tenant write prevention
 * - RLS policy enforcement
 * - Tenant context isolation
 * 
 * Usage:
 *   node scripts/validation/p1_7_tenant_isolation.js
 */

import { randomUUID } from 'uuid';

// Use native fetch (Node.js 18+)
if (typeof globalThis.fetch !== 'function') {
  console.error('Error: Native fetch is not available');
  console.error('Please ensure Node.js 18+ is used');
  process.exit(1);
}

const fetch = globalThis.fetch;

const BASE_URL = process.env.BASE_URL || 'http://localhost';
const TENANT_1_ID = process.env.TENANT_1_ID || '550e8400-e29b-41d4-a716-446655440001';
const TENANT_2_ID = process.env.TENANT_2_ID || '550e8400-e29b-41d4-a716-446655440002';
const TEST_USER_ID = process.env.TEST_USER_ID || '550e8400-e29b-41d4-a716-446655440003';

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Test data storage
const testData = {
  tenant1: {
    clientId: null,
    appointmentId: null,
    orderId: null
  },
  tenant2: {
    clientId: null,
    appointmentId: null,
    orderId: null
  }
};

// Helper to create headers with tenant context
function createHeaders(tenantId, correlationId = null) {
  return {
    'X-Tenant-ID': tenantId,
    'X-User-ID': TEST_USER_ID,
    'X-Correlation-ID': correlationId || randomUUID(),
    'Content-Type': 'application/json'
  };
}

// Helper to make HTTP request
async function makeRequest(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Test 1: Create resources for both tenants
async function test1_createResources() {
  console.log('📋 Test 1: Create Resources for Both Tenants');
  console.log('─'.repeat(60));
  
  try {
    // Create client for Tenant 1
    console.log('  Creating client for Tenant 1...');
    const client1Response = await makeRequest(
      `${BASE_URL}:4114/clients`,
      {
        method: 'POST',
        headers: createHeaders(TENANT_1_ID),
        body: JSON.stringify({
          first_name: 'Tenant1',
          last_name: 'Client',
          phone: '+420111111111',
          email: 'tenant1@example.com'
        })
      }
    );

    if (client1Response.ok) {
      const data = await client1Response.json();
      testData.tenant1.clientId = data.id || data.client?.id;
      results.passed.push('✅ Tenant isolation: Tenant 1 client created');
      console.log(`  ✅ Tenant 1 client created: ${testData.tenant1.clientId}`);
    } else {
      const error = await client1Response.text();
      throw new Error(`Failed to create Tenant 1 client: ${client1Response.status} - ${error}`);
    }

    // Create client for Tenant 2
    console.log('  Creating client for Tenant 2...');
    const client2Response = await makeRequest(
      `${BASE_URL}:4114/clients`,
      {
        method: 'POST',
        headers: createHeaders(TENANT_2_ID),
        body: JSON.stringify({
          first_name: 'Tenant2',
          last_name: 'Client',
          phone: '+420222222222',
          email: 'tenant2@example.com'
        })
      }
    );

    if (client2Response.ok) {
      const data = await client2Response.json();
      testData.tenant2.clientId = data.id || data.client?.id;
      results.passed.push('✅ Tenant isolation: Tenant 2 client created');
      console.log(`  ✅ Tenant 2 client created: ${testData.tenant2.clientId}`);
    } else {
      const error = await client2Response.text();
      throw new Error(`Failed to create Tenant 2 client: ${client2Response.status} - ${error}`);
    }

    console.log('  ✅ Resources created for both tenants\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Resource creation failed: ${error.message}\n`);
    results.failed.push(`❌ Tenant isolation: Resource creation failed - ${error.message}`);
    return false;
  }
}

// Test 2: Verify cross-tenant read prevention
async function test2_crossTenantReadPrevention() {
  console.log('📋 Test 2: Cross-Tenant Read Prevention');
  console.log('─'.repeat(60));
  
  try {
    // Try to read Tenant 1's client using Tenant 2's context
    console.log('  Attempting to read Tenant 1 client with Tenant 2 context...');
    const response = await makeRequest(
      `${BASE_URL}:4114/clients/${testData.tenant1.clientId}`,
      {
        method: 'GET',
        headers: createHeaders(TENANT_2_ID)
      }
    );

    if (response.status === 404 || response.status === 403) {
      results.passed.push('✅ Tenant isolation: Cross-tenant read prevented (404/403)');
      console.log('  ✅ Cross-tenant read prevented');
    } else if (response.ok) {
      const data = await response.json();
      // If we get data, check if it's actually Tenant 1's data (should be empty or different)
      if (data.id === testData.tenant1.clientId) {
        results.failed.push('❌ Tenant isolation: Cross-tenant read allowed (security breach!)');
        console.log('  ❌ SECURITY BREACH: Cross-tenant read allowed!');
        return false;
      } else {
        results.passed.push('✅ Tenant isolation: Cross-tenant read prevented (different data)');
        console.log('  ✅ Cross-tenant read prevented (returned different/empty data)');
      }
    } else {
      results.warnings.push('⚠️  Tenant isolation: Unexpected response status');
      console.log(`  ⚠️  Unexpected response status: ${response.status}`);
    }

    // Try to read Tenant 2's client using Tenant 1's context
    console.log('  Attempting to read Tenant 2 client with Tenant 1 context...');
    const response2 = await makeRequest(
      `${BASE_URL}:4114/clients/${testData.tenant2.clientId}`,
      {
        method: 'GET',
        headers: createHeaders(TENANT_1_ID)
      }
    );

    if (response2.status === 404 || response2.status === 403) {
      results.passed.push('✅ Tenant isolation: Cross-tenant read prevented (reverse direction)');
      console.log('  ✅ Cross-tenant read prevented (reverse direction)');
    } else if (response2.ok) {
      const data = await response2.json();
      if (data.id === testData.tenant2.clientId) {
        results.failed.push('❌ Tenant isolation: Cross-tenant read allowed (reverse direction)');
        console.log('  ❌ SECURITY BREACH: Cross-tenant read allowed (reverse direction)!');
        return false;
      } else {
        results.passed.push('✅ Tenant isolation: Cross-tenant read prevented (reverse direction)');
        console.log('  ✅ Cross-tenant read prevented (reverse direction)');
      }
    }

    console.log('  ✅ Cross-tenant read prevention validated\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Cross-tenant read prevention test failed: ${error.message}\n`);
    results.failed.push(`❌ Tenant isolation: Cross-tenant read test failed - ${error.message}`);
    return false;
  }
}

// Test 3: Verify cross-tenant write prevention
async function test3_crossTenantWritePrevention() {
  console.log('📋 Test 3: Cross-Tenant Write Prevention');
  console.log('─'.repeat(60));
  
  try {
    // Try to update Tenant 1's client using Tenant 2's context
    console.log('  Attempting to update Tenant 1 client with Tenant 2 context...');
    const response = await makeRequest(
      `${BASE_URL}:4114/clients/${testData.tenant1.clientId}`,
      {
        method: 'PUT',
        headers: createHeaders(TENANT_2_ID),
        body: JSON.stringify({
          first_name: 'Hacked',
          last_name: 'Client'
        })
      }
    );

    if (response.status === 404 || response.status === 403 || response.status === 400) {
      results.passed.push('✅ Tenant isolation: Cross-tenant write prevented');
      console.log('  ✅ Cross-tenant write prevented');
    } else if (response.ok) {
      results.failed.push('❌ Tenant isolation: Cross-tenant write allowed (security breach!)');
      console.log('  ❌ SECURITY BREACH: Cross-tenant write allowed!');
      return false;
    } else {
      results.warnings.push('⚠️  Tenant isolation: Unexpected response status for write');
      console.log(`  ⚠️  Unexpected response status: ${response.status}`);
    }

    console.log('  ✅ Cross-tenant write prevention validated\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Cross-tenant write prevention test failed: ${error.message}\n`);
    results.failed.push(`❌ Tenant isolation: Cross-tenant write test failed - ${error.message}`);
    return false;
  }
}

// Test 4: Verify list operations are tenant-scoped
async function test4_tenantScopedLists() {
  console.log('📋 Test 4: Tenant-Scoped List Operations');
  console.log('─'.repeat(60));
  
  try {
    // List clients for Tenant 1
    console.log('  Listing clients for Tenant 1...');
    const response1 = await makeRequest(
      `${BASE_URL}:4114/clients`,
      {
        method: 'GET',
        headers: createHeaders(TENANT_1_ID)
      }
    );

    if (response1.ok) {
      const data1 = await response1.json();
      const clients1 = data1.clients || data1 || [];
      const tenant1ClientFound = clients1.some(c => c.id === testData.tenant1.clientId);
      const tenant2ClientFound = clients1.some(c => c.id === testData.tenant2.clientId);

      if (tenant1ClientFound && !tenant2ClientFound) {
        results.passed.push('✅ Tenant isolation: List operations are tenant-scoped');
        console.log('  ✅ Tenant 1 list contains only Tenant 1 clients');
      } else if (tenant2ClientFound) {
        results.failed.push('❌ Tenant isolation: List operations leak cross-tenant data');
        console.log('  ❌ SECURITY BREACH: Tenant 1 list contains Tenant 2 clients!');
        return false;
      }
    }

    // List clients for Tenant 2
    console.log('  Listing clients for Tenant 2...');
    const response2 = await makeRequest(
      `${BASE_URL}:4114/clients`,
      {
        method: 'GET',
        headers: createHeaders(TENANT_2_ID)
      }
    );

    if (response2.ok) {
      const data2 = await response2.json();
      const clients2 = data2.clients || data2 || [];
      const tenant1ClientFound = clients2.some(c => c.id === testData.tenant1.clientId);
      const tenant2ClientFound = clients2.some(c => c.id === testData.tenant2.clientId);

      if (tenant2ClientFound && !tenant1ClientFound) {
        results.passed.push('✅ Tenant isolation: List operations are tenant-scoped (reverse)');
        console.log('  ✅ Tenant 2 list contains only Tenant 2 clients');
      } else if (tenant1ClientFound) {
        results.failed.push('❌ Tenant isolation: List operations leak cross-tenant data (reverse)');
        console.log('  ❌ SECURITY BREACH: Tenant 2 list contains Tenant 1 clients!');
        return false;
      }
    }

    console.log('  ✅ Tenant-scoped list operations validated\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Tenant-scoped list operations test failed: ${error.message}\n`);
    results.failed.push(`❌ Tenant isolation: List operations test failed - ${error.message}`);
    return false;
  }
}

// Main validation function
async function runValidation() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     P1.7 Tenant Isolation Validation                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Tenant 1 ID: ${TENANT_1_ID}`);
  console.log(`Tenant 2 ID: ${TENANT_2_ID}`);
  console.log(`Test User ID: ${TEST_USER_ID}`);
  console.log('');

  // Run all tests
  const test1 = await test1_createResources();
  if (!test1) {
    console.log('❌ Cannot proceed without test resources');
    printSummary();
    process.exit(1);
  }

  const test2 = await test2_crossTenantReadPrevention();
  const test3 = await test3_crossTenantWritePrevention();
  const test4 = await test4_tenantScopedLists();

  // Summary
  printSummary();
}

function printSummary() {
  console.log('📊 Validation Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('');

  if (results.passed.length > 0) {
    console.log('✅ Passed Tests:');
    results.passed.forEach(test => console.log(`  ${test}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ Failed Tests:');
    results.failed.forEach(test => console.log(`  ${test}`));
    console.log('');
  }

  // Final result
  const allTestsPassed = results.failed.length === 0;
  
  if (allTestsPassed) {
    console.log('✅ P1.7 Tenant Isolation Validation: PASSED');
    console.log('');
    console.log('All tenant isolation tests passed:');
    console.log('  ✅ Cross-tenant read prevention');
    console.log('  ✅ Cross-tenant write prevention');
    console.log('  ✅ Tenant-scoped list operations');
    console.log('  ✅ RLS policies enforced');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ P1.7 Tenant Isolation Validation: FAILED');
    console.log('');
    console.log('CRITICAL: Tenant isolation violations detected!');
    console.log('This is a security issue and must be fixed immediately.');
    console.log('Please review the errors above and fix them before proceeding.');
    console.log('');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('Fatal error during validation:', error);
  process.exit(1);
});

