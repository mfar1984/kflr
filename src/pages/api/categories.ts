import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';

/**
 * Public API: Get Categories
 * Used by frontend /store page for category filter buttons
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status = 'active' } = req.query;

    // Get all active categories with product count
    const categories = await query(
      `SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.image,
        c.parent_id,
        c.sort_order,
        c.status,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      LEFT JOIN products p ON pc.product_id = p.id AND p.status = 'active'
      WHERE c.status = ?
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC`,
      [status]
    ) as DbQueryResults;

    return res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

