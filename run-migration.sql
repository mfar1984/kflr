-- URGENT: Run this migration to fix refund functionality
-- Date: 2025-10-22
-- 
-- This adds:
-- 1. 'partial_refund' status to orders.status ENUM
-- 2. 'refund_amount' column to track refund amounts

USE kflr;

-- Add partial_refund to status ENUM
ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') DEFAULT 'pending';

-- Add refund_amount column
ALTER TABLE `orders` 
ADD COLUMN `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount refunded (for partial refunds)' AFTER `total_amount`;

-- Fix the order that was already refunded in CHIP
UPDATE orders 
SET status = 'refunded',
    refund_amount = 899.00,
    updated_at = NOW(),
    notes = CONCAT(COALESCE(notes, ''), '\nRefunded via CHIP: MYR 899.00 (auto-fixed after migration)')
WHERE reference = 'ORDER-1761120324508'
  AND status != 'refunded';

-- Verify changes
SELECT 'Migration completed!' as message;
SHOW COLUMNS FROM `orders` LIKE 'status';
SHOW COLUMNS FROM `orders` LIKE 'refund_amount';

-- Check the fixed order
SELECT reference, status, refund_amount, total_amount, chip_payment_id 
FROM orders 
WHERE reference = 'ORDER-1761120324508';

