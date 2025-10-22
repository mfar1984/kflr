# Auto-Cancel Cron Job Setup Guide

## Overview

Automatically cancel "viewed" orders older than 30 days while preserving analytics data.

---

## 📋 What It Does

1. **Find** orders with status "viewed" older than 30 days
2. **Log** analytics data to `order_analytics` table
3. **Cancel** via CHIP API (`POST /purchases/{id}/cancel/`)
4. **Update** local database status to "cancelled"

---

## 🔧 Setup Options

### **OPTION 1: Vercel Cron Jobs (Recommended for Vercel Hosting)**

#### 1. Create `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/admin/orders/auto-cancel",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule:** `0 2 * * *` = Daily at 2:00 AM (server time)

#### 2. Protect the endpoint

Update `/api/admin/orders/auto-cancel.ts`:

```typescript
// Add authorization check at the top of handler
const authHeader = req.headers.authorization;
const cronSecret = process.env.CRON_SECRET;

if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return res.status(401).json({ message: 'Unauthorized' });
}
```

#### 3. Add to `.env.local` and production:

```bash
CRON_SECRET=your_random_secret_key_here
```

#### 4. Deploy to Vercel

```bash
vercel --prod
```

#### 5. Test manually:

```bash
curl -X POST https://your-domain.com/api/admin/orders/auto-cancel \
  -H "Authorization: Bearer your_random_secret_key_here"
```

---

### **OPTION 2: Server Cron (for VPS/Dedicated Server)**

#### 1. Create cron script

```bash
# /home/user/scripts/auto-cancel-orders.sh
#!/bin/bash

# Auto-cancel viewed orders older than 30 days
curl -X POST https://your-domain.com/api/admin/orders/auto-cancel \
  -H "Authorization: Bearer your_random_secret_key_here" \
  -H "Content-Type: application/json" \
  >> /var/log/auto-cancel-orders.log 2>&1
```

#### 2. Make executable:

```bash
chmod +x /home/user/scripts/auto-cancel-orders.sh
```

#### 3. Add to crontab:

```bash
crontab -e
```

Add this line:

```cron
0 2 * * * /home/user/scripts/auto-cancel-orders.sh
```

**Schedule:** Daily at 2:00 AM

#### 4. Test manually:

```bash
bash /home/user/scripts/auto-cancel-orders.sh
```

---

### **OPTION 3: GitHub Actions (for GitHub-hosted projects)**

#### Create `.github/workflows/auto-cancel.yml`

```yaml
name: Auto-Cancel Viewed Orders

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  auto-cancel:
    runs-on: ubuntu-latest
    steps:
      - name: Call auto-cancel API
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/admin/orders/auto-cancel \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

#### Add secrets to GitHub:
- `APP_URL`: https://your-domain.com
- `CRON_SECRET`: your_random_secret_key_here

---

### **OPTION 4: Manual Execution (Admin Panel)**

Add a button in admin dashboard to manually trigger auto-cancel:

```typescript
// In admin dashboard
const handleAutoCancel = async () => {
  if (!confirm('Cancel all viewed orders older than 30 days?')) return;
  
  const response = await fetch('/api/admin/orders/auto-cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert(`Success! Cancelled: ${data.cancelled}, Failed: ${data.failed}`);
  } else {
    alert(`Error: ${data.message}`);
  }
};
```

---

## 📊 Analytics Tracking

All cancelled orders are logged to `order_analytics` table:

### Database Schema:

```sql
CREATE TABLE `order_analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `reference` VARCHAR(255) NOT NULL,
  `chip_payment_id` VARCHAR(255) NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'MYR',
  `status_before_cancel` ENUM(...) NOT NULL,
  `order_created_at` DATETIME NOT NULL,
  `order_cancelled_at` DATETIME NOT NULL,
  `days_until_cancel` INT,
  `cancel_reason` ENUM('auto_cleanup', 'manual_admin', 'user_request', 'expired'),
  `cancel_method` ENUM('chip_api', 'local_only'),
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Example Analytics Queries:

```sql
-- How many orders are cancelled automatically per month?
SELECT 
  DATE_FORMAT(order_cancelled_at, '%Y-%m') AS month,
  COUNT(*) AS total_cancelled,
  SUM(total_amount) AS total_amount_cancelled
FROM order_analytics
WHERE cancel_reason = 'auto_cleanup'
GROUP BY month
ORDER BY month DESC;

-- Average days before cancellation
SELECT 
  AVG(days_until_cancel) AS avg_days,
  MIN(days_until_cancel) AS min_days,
  MAX(days_until_cancel) AS max_days
FROM order_analytics
WHERE cancel_reason = 'auto_cleanup';

-- Top customers with abandoned checkouts
SELECT 
  customer_email,
  COUNT(*) AS abandoned_count,
  SUM(total_amount) AS total_abandoned_value
FROM order_analytics
WHERE status_before_cancel = 'viewed'
GROUP BY customer_email
ORDER BY abandoned_count DESC
LIMIT 10;
```

---

## 🧪 Testing

### 1. Run migration:

```bash
mysql -u root -p kflr < migrations/create-order-analytics-table.sql
```

### 2. Test API manually:

```bash
curl -X POST http://localhost:3000/api/admin/orders/auto-cancel \
  -H "Content-Type: application/json"
```

### 3. Check logs:

```bash
# Look for:
# 🔍 Searching for 'viewed' orders older than...
# 📋 Found X orders to cancel
# 📊 Logging analytics for ORDER-xxx
# ✅ Analytics logged
# 🚫 Cancelling in CHIP: xxx
# ✅ ORDER-xxx cancelled successfully
```

### 4. Verify database:

```sql
-- Check cancelled orders
SELECT * FROM orders WHERE status = 'cancelled' ORDER BY updated_at DESC LIMIT 10;

-- Check analytics
SELECT * FROM order_analytics ORDER BY created_at DESC LIMIT 10;
```

---

## ⚙️ Configuration

### Customize age threshold:

In `/api/admin/orders/auto-cancel.ts`, change:

```typescript
// Default: 30 days
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// Change to 60 days:
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
```

### Customize statuses to cancel:

```typescript
// Default: only 'viewed'
WHERE status = 'viewed'

// Add 'failed' too:
WHERE status IN ('viewed', 'failed')
```

---

## 🚨 Important Notes

1. **Analytics are preserved forever** - Order cancellation doesn't delete analytics
2. **CHIP API is called** - Orders are cancelled in CHIP system, not just local DB
3. **Safe to re-run** - Already cancelled orders are skipped
4. **Manual cancel also logs analytics** - Every cancel creates an analytics record
5. **Cannot cancel paid orders** - Only viewed/failed/pending orders can be cancelled

---

## 🔐 Security

1. **Add authentication** - Use `CRON_SECRET` env variable
2. **Rate limiting** - Prevent abuse of auto-cancel endpoint
3. **IP whitelist** - Only allow cron server IP (optional)
4. **Audit logging** - All cancellations are logged

---

## 📈 Monitoring

### Success Indicators:

- ✅ Cron job runs daily without errors
- ✅ Analytics table grows over time
- ✅ "viewed" orders older than 30 days are cleaned up
- ✅ CHIP portal shows "cancelled" status

### Error Indicators:

- ❌ Cron job fails
- ❌ Analytics not being logged
- ❌ Orders not being cancelled
- ❌ CHIP API errors

### Logs to Monitor:

```bash
# Vercel logs
vercel logs --prod

# Server logs
tail -f /var/log/auto-cancel-orders.log

# Database logs
SELECT * FROM order_analytics WHERE cancel_reason = 'auto_cleanup' ORDER BY created_at DESC LIMIT 100;
```

---

## ✅ Checklist

- [ ] Run migration to create `order_analytics` table
- [ ] Test `/api/admin/orders/auto-cancel` endpoint manually
- [ ] Verify analytics are being logged
- [ ] Setup cron job (choose option above)
- [ ] Add `CRON_SECRET` to environment variables
- [ ] Test cron job execution
- [ ] Monitor logs for first few runs
- [ ] Verify CHIP portal status matches local DB
- [ ] Setup monitoring/alerts (optional)

---

## 🎉 Done!

Your auto-cancel system is now running! "Viewed" orders will be automatically cleaned up after 30 days while preserving valuable analytics data.

**Manual trigger:** Visit admin panel or run cron manually  
**Automatic:** Runs daily at 2:00 AM  
**Analytics:** Queryable in `order_analytics` table forever

