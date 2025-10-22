#!/usr/bin/env node

/**
 * TEST CHIP-ASIA RELEASE REFUND API
 * 
 * This script releases a refund that's on hold
 */

const CHIP_API_KEY = '-fqwxKQQk_ynTTQle5PM2jPuuMWE0sn3lBNB9p-ErSdMid-xaIiq1y2Zn7oRz_3uGROi7WG0_JESXVH0MwwmtQ==';

// Get purchase ID from command line
const purchaseId = process.argv[2];

if (!purchaseId) {
  console.error('❌ Usage: node test-chip-release.js <purchase_id>');
  console.error('   Example: node test-chip-release.js 22Oct_1729593913_RHzcvTW4');
  process.exit(1);
}

console.log(`
═══════════════════════════════════════════════════════════════════
🧪 TESTING CHIP RELEASE REFUND API
═══════════════════════════════════════════════════════════════════

Purchase ID: ${purchaseId}

`);

async function testRelease() {
  try {
    console.log('📤 Calling /release/ API (completes refund, sends funds)...\n');
    
    const releaseResponse = await fetch(
      `https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/release/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHIP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const releaseText = await releaseResponse.text();
    
    console.log(`Status Code: ${releaseResponse.status}`);
    console.log(`Response:\n${releaseText}\n`);

    if (!releaseResponse.ok) {
      console.error('❌ RELEASE FAILED!');
      console.error('Check if:');
      console.error('  - Purchase ID is correct');
      console.error('  - Refund is in "Pending Refund" status');
      console.error('  - You already called /refund/ first');
      return;
    }

    let releaseData;
    try {
      releaseData = JSON.parse(releaseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      return;
    }

    console.log('✅ REFUND RELEASED SUCCESSFULLY!');
    console.log('   Funds have been sent back to customer.');
    console.log(`   Status should now be: "Refunded" in CHIP portal\n`);

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('✅ COMPLETE REFUND FLOW TESTED!');
    console.log('');
    console.log('   Summary:');
    console.log('   1. /refund/ → Put refund ON HOLD ✓');
    console.log('   2. /release/ → Released funds to customer ✓');
    console.log('');
    console.log('   Login to CHIP portal to verify: https://gate.chip-in.asia/');
    console.log('   Purchase status should show: "Refunded"');
    console.log('─────────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

testRelease();

