import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';

/**
 * Admin API: Products CRUD
 * GET: List all products with filters
 * POST: Create new product
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add authentication check here
  // if (!isAuthenticated(req)) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET: List products
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      category,
      search,
      status,
      sort = 'newest',
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Base query
    let sql = `
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names,
        GROUP_CONCAT(DISTINCT c.id) as category_ids
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE 1=1
    `.trim();

    const params: (string | number)[] = [];

    // Filters
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status as string);
    }

    if (category) {
      sql += ` AND c.id = ?`;
      params.push(category as string);
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Group by product ID
    sql += ` GROUP BY p.id`;

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY p.name ASC`;
        break;
      case 'stock_asc':
        sql += ` ORDER BY p.stock_quantity ASC`;
        break;
      case 'stock_desc':
        sql += ` ORDER BY p.stock_quantity DESC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Get total for pagination (before adding LIMIT/OFFSET)
    let countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT p.id) as total FROM');
    countSql = countSql.replace(/GROUP BY[\s\S]*?$/, '').replace(/ORDER BY[\s\S]*?$/, '');
    
    // Pass params if there are filters, otherwise undefined
    const countResult = await query(countSql, params.length > 0 ? params : undefined) as DbQueryResults;
    const total = (countResult[0]?.total as number) || 0;

    // Add pagination - always add LIMIT and OFFSET
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    // Now params ALWAYS has values (at minimum: limitNum and offset), so ALWAYS pass params
    const products = await query(sql, params) as DbQueryResults;

    // Parse JSON fields with proper error handling
    const parsedProducts = products.map(product => {
      // Helper function to safely parse JSON
      const safeJsonParse = (value: unknown, fallback: unknown = null) => {
        // If empty or null, return fallback
        if (!value || value === '') return fallback;
        
        // If already an object/array (MySQL2 auto-parses JSON), return as-is
        if (typeof value === 'object') return value;
        
        // If string, try to parse
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error('JSON parse error:', e, 'Value:', value);
            return fallback;
          }
        }
        
        // Otherwise return fallback
        return fallback;
      };

      return {
        ...product,
        images: safeJsonParse(product.images, []),
        tags: safeJsonParse(product.tags, []),
        specifications: safeJsonParse(product.specifications, null),
        features: safeJsonParse(product.features, null),
        // NEW EXTENDED FIELDS
        gallery_images: safeJsonParse(product.gallery_images, []),
        key_highlights: safeJsonParse(product.key_highlights, []),
        included_items: safeJsonParse(product.included_items, []),
        category_ids: product.category_ids ? (product.category_ids as string).split(',').map((id: string) => parseInt(id)) : []
      };
    });

    return res.status(200).json({
      success: true,
      products: parsedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST: Create product
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      slug,
      description,
      short_description,
      price,
      compare_price,
      cost_price,
      currency = 'MYR',
      sku,
      barcode,
      stock_quantity = 0,
      track_inventory = true,
      low_stock_threshold = 5,
      weight,
      dimensions,
      vendor,
      brand,
      images,
      featured_image,
      tags,
      status = 'active',
      seo_title,
      seo_description,
      seo_keywords,
      specifications,
      features,
      notes,
      categories = [],
      variants = [],
      // NEW EXTENDED FIELDS
      gallery_images = [],
      key_highlights = [],
      included_items = [],
      tab_overview,
      tab_specifications,
      tab_performance,
      tab_features,
      tab_support
    } = req.body;

    // Validation
    if (!name || !slug || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, slug, and price are required'
      });
    }

    // Check if slug already exists
    const existing = await query(
      `SELECT id FROM products WHERE slug = ?`,
      [slug]
    ) as DbQueryResults;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }

    // Insert product (with NEW EXTENDED FIELDS)
    const result = await query(
      `INSERT INTO products (
        name, slug, description, short_description, price, compare_price, cost_price, currency,
        sku, barcode, stock_quantity, track_inventory, low_stock_threshold,
        weight, dimensions, vendor, brand, images, featured_image, tags, status,
        seo_title, seo_description, seo_keywords, specifications, features, notes,
        gallery_images, key_highlights, included_items,
        tab_overview, tab_specifications, tab_performance, tab_features, tab_support
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, slug, description, short_description, price, compare_price, cost_price, currency,
        sku, barcode, stock_quantity, track_inventory, low_stock_threshold,
        weight, dimensions, vendor, brand,
        images ? JSON.stringify(images) : null,
        featured_image,
        tags ? JSON.stringify(tags) : null,
        status, seo_title, seo_description, seo_keywords,
        specifications ? JSON.stringify(specifications) : null,
        features ? JSON.stringify(features) : null,
        notes,
        // NEW EXTENDED FIELDS
        gallery_images && gallery_images.length > 0 ? JSON.stringify(gallery_images) : null,
        key_highlights && key_highlights.length > 0 ? JSON.stringify(key_highlights) : null,
        included_items && included_items.length > 0 ? JSON.stringify(included_items) : null,
        tab_overview || null,
        tab_specifications || null,
        tab_performance || null,
        tab_features || null,
        tab_support || null
      ]
    ) as DbQueryResults & { insertId?: number };

    const productId = result.insertId;

    // Insert category associations
    if (categories && categories.length > 0) {
      const categoryValues = categories.map((catId: number) => [productId, catId]);
      await query(
        `INSERT INTO product_categories (product_id, category_id) VALUES ?`,
        [categoryValues]
      );
    }

    // Insert variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await query(
          `INSERT INTO product_variants (
            product_id, option1_name, option1_value, option2_name, option2_value, 
            option3_name, option3_value, sku, price, compare_price, stock_quantity, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            productId,
            variant.option1_name,
            variant.option1_value,
            variant.option2_name || null,
            variant.option2_value || null,
            variant.option3_name || null,
            variant.option3_value || null,
            variant.sku || null,
            variant.price || 0,
            variant.compare_price || null,
            variant.stock_quantity || 0
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

