import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const paymentData = req.body;
    
    console.log('CHIP Payment Callback:', paymentData);

    // Verify the callback is from CHIP (in production, verify signature)
    // For now, we'll just log and store the payment status

    const { status, reference } = paymentData;

    // Handle different payment statuses
    switch (status) {
      case 'paid':
        console.log(`Payment successful for order ${reference}`);
        // TODO: Update order status in database
        // TODO: Send confirmation email
        // TODO: Update inventory
        break;

      case 'failed':
        console.log(`Payment failed for order ${reference}`);
        // TODO: Update order status in database
        // TODO: Send failure notification
        break;

      case 'cancelled':
        console.log(`Payment cancelled for order ${reference}`);
        // TODO: Update order status in database
        break;

      default:
        console.log(`Unknown payment status: ${status} for order ${reference}`);
    }

    // Always respond with 200 OK to acknowledge receipt
    return res.status(200).json({ 
      success: true, 
      message: 'Callback received' 
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return 200 to prevent CHIP from retrying
    return res.status(200).json({ 
      success: false, 
      message: 'Callback received but processing failed' 
    });
  }
}

