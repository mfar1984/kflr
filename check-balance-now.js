#!/usr/bin/env node

const CHIP_API_KEY = '-fqwxKQQk_ynTTQle5PM2jPuuMWE0sn3lBNB9p-ErSdMid-xaIiq1y2Zn7oRz_3uGROi7WG0_JESXVH0MwwmtQ==';

async function checkBalance() {
  try {
    console.log('\n🔍 Fetching CHIP-Asia Balance...\n');
    
    const response = await fetch('https://gate.chip-in.asia/api/v1/account/json/balance/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHIP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('💰 CHIP-ASIA ACCOUNT BALANCE');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
    // MYR Balance
    if (data.MYR) {
      const myr = data.MYR;
      console.log('🇲🇾 MYR (Malaysian Ringgit):');
      console.log(`   Available Balance:  MYR ${(myr.available_balance / 100).toFixed(2)}`);
      console.log(`   Gross Balance:      MYR ${(myr.gross_balance / 100).toFixed(2)}`);
      console.log(`   Reserved:           MYR ${(myr.reserved / 100).toFixed(2)}`);
      console.log(`   Pending Outgoing:   MYR ${(myr.pending_outgoing / 100).toFixed(2)}`);
      console.log(`   Fee Sell:           MYR ${(myr.fee_sell / 100).toFixed(2)}\n`);
    }
    
    // USD Balance
    if (data.USD) {
      const usd = data.USD;
      console.log('🇺🇸 USD (US Dollar):');
      console.log(`   Available Balance:  USD ${(usd.available_balance / 100).toFixed(2)}`);
      console.log(`   Gross Balance:      USD ${(usd.gross_balance / 100).toFixed(2)}\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`   Total Available (MYR): ${data.MYR ? (data.MYR.available_balance / 100).toFixed(2) : '0.00'}`);
    console.log(`   Total Available (USD): ${data.USD ? (data.USD.available_balance / 100).toFixed(2) : '0.00'}`);
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
    console.log('Raw JSON Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkBalance();
