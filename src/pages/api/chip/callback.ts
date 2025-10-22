import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

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

    const { status, reference, payment } = paymentData;

    // Handle different payment statuses
    switch (status) {
      case 'paid':
        console.log(`Payment successful for order ${reference}`);
        try {
          // Update order status to paid
          await query(
            `UPDATE orders 
             SET status = 'paid', 
                 paid_at = NOW(),
                 payment_method = ?,
                 updated_at = NOW()
             WHERE reference = ?`,
            [payment?.payment_method || 'online', reference]
          );
          console.log(`✅ Order ${reference} marked as paid`);
          
          // TODO: Send confirmation email
          // TODO: Update inventory
        } catch (dbError) {
          console.error('❌ Failed to update order status:', dbError);
        }
        break;

      case 'failed':
        console.log(`Payment failed for order ${reference}`);
        try {
          await query(
            `UPDATE orders 
             SET status = 'failed', updated_at = NOW()
             WHERE reference = ?`,
            [reference]
          );
          console.log(`✅ Order ${reference} marked as failed`);
          // TODO: Send failure notification
        } catch (dbError) {
          console.error('❌ Failed to update order status:', dbError);
        }
        break;

      case 'cancelled':
        console.log(`Payment cancelled for order ${reference}`);
        try {
          await query(
            `UPDATE orders 
             SET status = 'cancelled', updated_at = NOW()
             WHERE reference = ?`,
            [reference]
          );
          console.log(`✅ Order ${reference} marked as cancelled`);
        } catch (dbError) {
          console.error('❌ Failed to update order status:', dbError);
        }
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

