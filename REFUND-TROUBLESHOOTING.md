# 🚨 REFUND ISSUE TROUBLESHOOTING

## MASALAH:
1. ❌ Popup refund amount TIDAK keluar
2. ❌ Status terus jadi "Complete Refund" (bukan "Refund on Hold")
3. ❌ CHIP-Asia status masih "Paid" (bukan "Pending Refund")

---

## PUNCA YANG MUNGKIN:

### 1. DATABASE MIGRATION BELUM RUN ⚠️
Column `refund_amount` dan status `partial_refund` belum wujud dalam database.

**Check:**
```sql
USE kflr;
SHOW COLUMNS FROM orders LIKE 'refund_amount';
SHOW COLUMNS FROM orders LIKE 'status';
```

**Fix:**
```sql
USE kflr;

ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') DEFAULT 'pending';

ALTER TABLE `orders` 
ADD COLUMN `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount refunded (for partial refunds)' AFTER `total_amount`;
```

---

### 2. BROWSER CACHE (Old JavaScript) ⚠️
Browser masih guna kod lama yang terus update ke `refunded`.

**Fix:**
1. **Hard Refresh:** `Cmd + Shift + R` (Mac) atau `Ctrl + Shift + R` (Windows)
2. **Clear Cache:** Chrome → Settings → Privacy → Clear browsing data → Cached images
3. **Incognito Mode:** Try dalam private/incognito window

---

### 3. SERVER CODE BELUM RELOAD ⚠️
Next.js dev server mungkin tak detect file changes.

**Fix:**
1. Stop server: `Ctrl + C`
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

---

## STEP-BY-STEP HARD RESET:

```bash
# 1. Stop dev server (Ctrl + C)

# 2. Clear Next.js cache
rm -rf .next

# 3. Clear node_modules cache (optional)
rm -rf node_modules/.cache

# 4. Rebuild
npm run build

# 5. Start dev server
npm run dev
```

---

## AFTER RESET, TEST AGAIN:

1. **Open browser** (Incognito mode recommended)
2. **Login:** `http://localhost:3000/admin/login`
3. **Go to Orders & Payments**
4. **Find PAID order**
5. **Click "Show"** → **Click "Refund"**
6. **EXPECTED:** Popup should appear asking for refund amount
7. **Enter amount** (e.g., half of total for partial refund)
8. **EXPECTED:** Confirmation dialog with "Partial Refund" or "Full Refund"
9. **Click OK**
10. **CHECK:**
    - Orders page: Should show "Refund on Hold (MYR X)" - Yellow badge
    - CHIP-Asia portal: Should show "Pending Refund"
    - Server logs: Should show `✅ Refund placed on hold in CHIP`

---

## CHECK SERVER LOGS:

When you click "Refund", terminal should show:

```
🔄 Requesting refund for order ORDER-XXX: MYR 899.00
CHIP Refund Response Status: 200
CHIP Refund Response: {...}
✅ Refund placed on hold in CHIP (Pending Refund status)
```

**If you see errors:**
```
❌ CHIP Refund Error: {...}
💥 Refund exception: ...
```

Then CHIP API call FAILED. Check:
- `CHIP_API_KEY` in `.env.local`
- CHIP API credentials valid
- Network connection

---

## IF STILL NOT WORKING:

### Debug: Check API Response Manually

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Click "Refund" button
4. Find request to `/api/chip-asia/refund`
5. Check response:

**EXPECTED (Success):**
```json
{
  "success": true,
  "message": "Refund request placed on hold in CHIP...",
  "refundAmount": 899,
  "chipStatus": "Pending Refund"
}
```

**FAILURE EXAMPLE:**
```json
{
  "success": false,
  "message": "Failed to process refund request in CHIP",
  "error": {...}
}
```

---

## CONTACT ME IF:

1. Migration sudah run ✓
2. Browser cache sudah clear ✓
3. Server sudah restart ✓
4. Popup masih tak keluar ✗

Then ada issue lain yang perlu investigate.

Send me:
- Screenshot of server logs
- Screenshot of browser DevTools Network tab
- Screenshot of MySQL `SHOW COLUMNS FROM orders;`

