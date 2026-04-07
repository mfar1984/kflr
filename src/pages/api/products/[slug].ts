import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';

/**
 * Public API: Get Product by Slug
 * Used by frontend product detail pages
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    // Get product details
    const products = await query(
      `SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names,
        GROUP_CONCAT(DISTINCT c.slug SEPARATOR ',') as category_slugs
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.slug = ?
      GROUP BY p.id`,
      [slug]
    ) as DbQueryResults;

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Get product variants if any
    const variants = await query(
      `SELECT * FROM product_variants WHERE product_id = ? AND status = 'active' ORDER BY id`,
      [product.id as number]
    ) as DbQueryResults;

    // Parse JSON fields
    const parsedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images as string) : [],
      tags: product.tags ? JSON.parse(product.tags as string) : [],
      specifications: product.specifications ? JSON.parse(product.specifications as string) : null,
      features: product.features ? JSON.parse(product.features as string) : null,
      category_ids: product.category_ids ? (product.category_ids as string).split(',').map((id: string) => parseInt(id)) : [],
      category_names: product.category_names || '',
      category_slugs: product.category_slugs ? (product.category_slugs as string).split(',') : [],
      variants: variants.length > 0 ? variants : null
    };

    return res.status(200).json({
      success: true,
      product: parsedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

