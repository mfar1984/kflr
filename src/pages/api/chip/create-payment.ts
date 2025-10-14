import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { customerDetails, cartItems, totalAmount } = req.body;

    console.log('=== CHIP Payment Request ===');
    console.log('Customer:', customerDetails.email);
    console.log('Total Amount:', totalAmount);
    console.log('Cart Items:', cartItems.length);

    // CHIP Configuration
    const CHIP_API_KEY = process.env.CHIP_API_KEY || 'eacbT3tKeP2hMFDVn-aPhYYCtboMRjTcQ5ZHkG8wLIwPKMWeaPxUYFwD4OQVjascwN3fy947qMwgrcHqv4r6kw==';
    const CHIP_BRAND_ID = process.env.CHIP_BRAND_ID || 'c5f96f76-b79c-4963-8698-086d6ce28062';
    const CHIP_API_URL = 'https://gate.chip-in.asia/api/v1';

    console.log('CHIP Brand ID:', CHIP_BRAND_ID);
    console.log('CHIP API Key (first 20 chars):', CHIP_API_KEY.substring(0, 20) + '...');

    // Generate unique reference
    const reference = `ORDER-${Date.now()}`;

    // Prepare purchase details
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isLocalhost = siteUrl.includes('localhost');
    
    const purchaseData: Record<string, unknown> = {
      brand_id: CHIP_BRAND_ID,
      client: {
        email: customerDetails.email,
        phone: customerDetails.phone,
        full_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        street_address: customerDetails.address,
        city: customerDetails.city,
        zip_code: customerDetails.postcode,
        country: customerDetails.country || 'MY',
      },
      purchase: {
        total: Math.round(totalAmount * 100), // Convert to cents
        currency: 'MYR',
        products: cartItems.map((item: { name: string; price: number; quantity: number }) => ({
          name: item.name,
          price: Math.round(item.price * 100),
          quantity: item.quantity,
        })),
        notes: customerDetails.notes || 'Order from KF Legacy Resources Store',
      },
      reference: reference,
      success_redirect: `${siteUrl}/payment/success?reference=${reference}`,
      failure_redirect: `${siteUrl}/payment/failed?reference=${reference}`,
      cancel_redirect: `${siteUrl}/cart`,
      creator_agent: 'KF Legacy Resources Store v1.0',
      platform: 'api',
      send_receipt: true,
    };
    
    // Only add success_callback in production (CHIP doesn't allow localhost callbacks with custom ports)
    if (!isLocalhost) {
      purchaseData.success_callback = `${siteUrl}/api/chip/callback`;
      console.log('✅ Callback URL included (production mode)');
    } else {
      console.log('⚠️ Callback URL skipped (localhost development mode)');
    }

    console.log('Purchase Data:', JSON.stringify(purchaseData, null, 2));

    // Create payment with CHIP
    const response = await fetch(`${CHIP_API_URL}/purchases/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });

    const responseText = await response.text();
    console.log('CHIP Response Status:', response.status);
    console.log('CHIP Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse CHIP response:', responseText);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from payment gateway',
        error: responseText,
      });
    }

    if (response.ok && data.id) {
      console.log('✅ Payment created successfully:', data.id);
      return res.status(200).json({
        success: true,
        checkoutUrl: data.checkout_url,
        purchaseId: data.id,
        reference: reference,
      });
    } else {
      console.error('❌ CHIP API Error:', data);
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment',
        error: data,
        details: data.errors || data.message || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('💥 Payment creation exception:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

