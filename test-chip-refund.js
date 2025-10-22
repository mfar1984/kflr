#!/usr/bin/env node

/**
 * TEST CHIP-ASIA REFUND API
 * 
 * This script tests the CHIP refund flow:
 * 1. Call /refund/ to put refund ON HOLD
 * 2. Call /release/ to complete the refund
 */

const CHIP_API_KEY = '-fqwxKQQk_ynTTQle5PM2jPuuMWE0sn3lBNB9p-ErSdMid-xaIiq1y2Zn7oRz_3uGROi7WG0_JESXVH0MwwmtQ==';

// Get purchase ID from command line
const purchaseId = process.argv[2];
const amountMYR = parseFloat(process.argv[3]) || 899; // Default 899 MYR

if (!purchaseId) {
  console.error('❌ Usage: node test-chip-refund.js <purchase_id> [amount]');
  console.error('   Example: node test-chip-refund.js 22Oct_1729593913_RHzcvTW4 450');
  process.exit(1);
}

const amountCents = Math.round(amountMYR * 100);

console.log(`
═══════════════════════════════════════════════════════════════════
🧪 TESTING CHIP REFUND API
═══════════════════════════════════════════════════════════════════

Purchase ID: ${purchaseId}
Refund Amount: MYR ${amountMYR} (${amountCents} cents)

`);

async function testRefund() {
  try {
    // STEP 1: Call /refund/ to put refund ON HOLD
    console.log('📤 STEP 1: Calling /refund/ API (puts refund ON HOLD)...\n');
    
    const refundResponse = await fetch(
      `https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/refund/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHIP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountCents
        })
      }
    );

    const refundText = await refundResponse.text();
    
    console.log(`Status Code: ${refundResponse.status}`);
    console.log(`Response:\n${refundText}\n`);

    if (!refundResponse.ok) {
      console.error('❌ REFUND FAILED!');
      console.error('Check if:');
      console.error('  - Purchase ID is correct');
      console.error('  - Purchase status is "paid"');
      console.error('  - API key is valid');
      return;
    }

    let refundData;
    try {
      refundData = JSON.parse(refundText);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      return;
    }

    console.log('✅ REFUND REQUEST SUCCESSFUL!');
    console.log(`   Refund ID: ${refundData.id || 'N/A'}`);
    console.log(`   Status should now be: "Pending Refund" in CHIP portal\n`);

    // STEP 2: Ask user if they want to release the refund
    console.log('─────────────────────────────────────────────────────────────────');
    console.log('⚠️  Refund is now ON HOLD in CHIP.');
    console.log('   Login to CHIP portal to verify: https://gate.chip-in.asia/');
    console.log('   Purchase status should show: "Pending Refund"');
    console.log('');
    console.log('   To COMPLETE the refund (release funds), run:');
    console.log(`   node test-chip-release.js ${purchaseId}`);
    console.log('─────────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

testRefund();

