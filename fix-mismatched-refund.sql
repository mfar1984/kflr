-- Fix order yang status local DB = 'paid' but CHIP = 'refunded'
-- This happens when admin cancelled refund after CHIP already processed it
-- 
-- ORDER-1761116706163 case:
-- - Local DB: paid (after cancel refund)
-- - CHIP: refunded (money already returned to customer)
--
-- Solution: Update local DB to match CHIP reality

USE kflr;

-- Check current status
SELECT 
  reference, 
  status, 
  total_amount, 
  refund_amount,
  chip_payment_id,
  created_at,
  updated_at
FROM orders 
WHERE reference = 'ORDER-1761116706163';

-- Update to match CHIP status (refunded)
UPDATE orders 
SET status = 'refunded',
    refund_amount = total_amount,  -- Full refund
    updated_at = NOW(),
    notes = CONCAT(COALESCE(notes, ''), '\n[FIXED] Status corrected to match CHIP (refunded) - ', NOW())
WHERE reference = 'ORDER-1761116706163';

-- Verify update
SELECT 
  reference, 
  status, 
  total_amount, 
  refund_amount,
  notes
FROM orders 
WHERE reference = 'ORDER-1761116706163';

-- Note: This order has been refunded in CHIP, money already returned to customer.
-- Local DB status now matches reality.

