import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const orderId = parseInt(Array.isArray(id) ? id[0] : id || '', 10);
  if (!orderId || Number.isNaN(orderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order id' });
  }

  if (req.method === 'PATCH') {
    try {
      const { status, paid_at } = req.body as { status?: string; paid_at?: string | null };
      const allowed: Record<string, true> = { pending: true, paid: true, failed: true, cancelled: true, refunded: true };
      if (!status || !allowed[status]) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      // Build update fields
      const setParts: string[] = ['status = ?'];
      const params: (string | number | null)[] = [status];

      if (typeof paid_at !== 'undefined') {
        // Expect ISO string or null
        if (paid_at === null || paid_at === '') {
          setParts.push('paid_at = NULL');
        } else {
          setParts.push('paid_at = ?');
          params.push(paid_at);
        }
      }

      params.push(orderId);
      await query(
        `UPDATE orders SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1`,
        params as (string | number | null)[]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to update order:', error);
      return res.status(500).json({ success: false, message: 'Failed to update order' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}


