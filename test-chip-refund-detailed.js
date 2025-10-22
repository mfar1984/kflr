#!/usr/bin/env node

const CHIP_API_KEY = '-fqwxKQQk_ynTTQle5PM2jPuuMWE0sn3lBNB9p-ErSdMid-xaIiq1y2Zn7oRz_3uGROi7WG0_JESXVH0MwwmtQ==';

const purchaseId = process.argv[2] || '22Oct_1729606783_wPxGE7Gl'; // ORDER-1761124750863
const amountMYR = parseFloat(process.argv[3]) || 22497; 
const amountCents = Math.round(amountMYR * 100);

console.log(`
═══════════════════════════════════════════════════════════════════
🧪 TEST: Check CHIP refund behavior
═══════════════════════════════════════════════════════════════════
Purchase ID: ${purchaseId}
Amount: MYR ${amountMYR} (${amountCents} cents)
`);

async function testRefund() {
  try {
    console.log('📤 Calling CHIP /refund/ API...\n');
    
    const response = await fetch(
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

    const text = await response.text();
    
    console.log(`Status: ${response.status}\n`);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('Response (formatted):');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n─────────────────────────────────────────────────────────────────');
      console.log('KEY FIELDS:');
      console.log(`  Type: ${data.type || 'N/A'}`);
      console.log(`  Status: ${data.status || 'N/A'}`);
      console.log(`  Payment Type: ${data.payment?.payment_type || 'N/A'}`);
      console.log(`  Paid On: ${data.payment?.paid_on || 'N/A'}`);
      console.log(`  Pending Amount: ${data.payment?.pending_amount || 'N/A'}`);
      console.log(`  Pending Unfreeze: ${data.payment?.pending_unfreeze_on || 'N/A'}`);
      console.log('─────────────────────────────────────────────────────────────────\n');
      
      if (data.status === 'success' && data.payment?.paid_on) {
        console.log('❗ REFUND WAS PROCESSED IMMEDIATELY!');
        console.log('   Status in CHIP portal should be: "Refunded"');
        console.log('   NOT "Pending Refund"\n');
      } else if (data.payment?.pending_amount > 0) {
        console.log('✅ REFUND IS ON HOLD!');
        console.log('   Status in CHIP portal should be: "Pending Refund"');
        console.log(`   Call /release/ to complete refund\n`);
      }
      
    } catch (e) {
      console.log('Raw Response (not JSON):');
      console.log(text);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testRefund();
