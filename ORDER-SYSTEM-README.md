# Order Management System Documentation

## 📦 Overview

Complete order management system integrated with CHIP payment gateway. All orders are automatically saved to the database when customers complete checkout.

---

## 🗄️ Database Schema

### **Orders Table** (`orders`)

Stores main order information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key (auto increment) |
| `reference` | VARCHAR(50) | Unique order reference (ORDER-xxxxx) |
| `chip_payment_id` | VARCHAR(100) | CHIP payment ID from gateway |
| `customer_first_name` | VARCHAR(100) | Customer first name |
| `customer_last_name` | VARCHAR(100) | Customer last name |
| `customer_email` | VARCHAR(255) | Customer email |
| `customer_phone` | VARCHAR(50) | Customer phone number |
| `customer_address` | TEXT | Shipping address |
| `customer_city` | VARCHAR(100) | City |
| `customer_state` | VARCHAR(100) | State/Province |
| `customer_postcode` | VARCHAR(20) | Postal code |
| `customer_country` | VARCHAR(10) | Country code (default: MY) |
| `total_amount` | DECIMAL(10,2) | Total order amount |
| `currency` | VARCHAR(10) | Currency (default: MYR) |
| `status` | ENUM | Order status (see below) |
| `payment_method` | VARCHAR(50) | Payment method used |
| `notes` | TEXT | Customer notes |
| `chip_checkout_url` | TEXT | CHIP checkout URL |
| `paid_at` | DATETIME | Payment completion timestamp |
| `created_at` | DATETIME | Order creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

**Order Statuses:**
- `pending` - Order created, awaiting payment
- `paid` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled
- `refunded` - Order refunded

---

### **Order Items Table** (`order_items`)

Stores individual items in each order:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key (auto increment) |
| `order_id` | INT | Foreign key to orders table |
| `product_id` | INT | Product ID |
| `product_name` | VARCHAR(255) | Product name |
| `product_price` | DECIMAL(10,2) | Unit price |
| `quantity` | INT | Quantity ordered |
| `selected_options` | JSON | Selected product options |
| `subtotal` | DECIMAL(10,2) | Line total (price × quantity) |
| `created_at` | DATETIME | Item creation timestamp |

---

## 🔄 Order Flow

### **1. Customer Checkout**

```
User clicks "Proceed to Checkout" from cart
  ↓
Fills in checkout form (name, email, address, etc.)
  ↓
Clicks "Place Order"
  ↓
Frontend sends POST request to /api/chip/create-payment
```

### **2. Order Creation & Payment**

```javascript
// /api/chip/create-payment.ts

1. Generate unique reference (ORDER-timestamp)
2. Create payment with CHIP API
3. IF CHIP responds OK:
   ✅ Save order to database (status: 'pending')
   ✅ Save all order items to database
   ✅ Return checkout URL to frontend
4. Frontend redirects to CHIP payment page
```

### **3. Customer Pays**

```
Customer completes payment on CHIP
  ↓
CHIP processes payment
  ↓
CHIP redirects customer to success/failed page
  ↓
CHIP sends webhook callback to /api/chip/callback
```

### **4. Order Status Update**

```javascript
// /api/chip/callback.ts

1. Receive callback from CHIP
2. Extract: status, reference, payment_method
3. UPDATE orders table:
   - IF status = 'paid':
     ✅ Set status = 'paid'
     ✅ Set paid_at = NOW()
     ✅ Set payment_method
   - IF status = 'failed':
     ✅ Set status = 'failed'
   - IF status = 'cancelled':
     ✅ Set status = 'cancelled'
```

---

## 🔍 Retrieving Orders

### **API Endpoint:** `/api/orders`

**Method:** GET

**Query Parameters:**
- `email` - Get all orders for a customer email
- `reference` - Get specific order by reference

### **Example Usage:**

#### Get all orders for a customer:
```bash
GET /api/orders?email=customer@example.com
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "reference": "ORDER-1760403565035",
      "customer_first_name": "John",
      "customer_last_name": "Doe",
      "customer_email": "customer@example.com",
      "total_amount": 899.00,
      "status": "paid",
      "paid_at": "2025-10-14 10:30:00",
      "created_at": "2025-10-14 10:25:00",
      "items": [
        {
          "product_name": "Netgate 1100 pfSense+ Security Gateway",
          "product_price": 899.00,
          "quantity": 1,
          "subtotal": 899.00
        }
      ]
    }
  ]
}
```

#### Get specific order:
```bash
GET /api/orders?reference=ORDER-1760403565035
```

---

## 📊 Database Setup

### **1. Run SQL Schema**

Execute the SQL in `database-schema.sql`:

```bash
mysql -u your_user -p kflr < database-schema.sql
```

Or manually run:
```sql
-- Creates tables: orders, order_items
-- See database-schema.sql for full schema
```

### **2. Configure Database Connection**

Update `.env.local`:
```env
DB_HOST=localhost
DB_USER=kflegacy_user
DB_PASSWORD=your_password
DB_NAME=kflegacy_db
DB_PORT=3306
```

---

## 🎯 Order Status Management

### **Automatic Status Updates:**

| Event | Status Change |
|-------|--------------|
| Order created | `pending` |
| Payment successful (CHIP callback) | `paid` |
| Payment failed | `failed` |
| Payment cancelled | `cancelled` |

### **Manual Status Updates:**

To manually update order status:

```sql
UPDATE orders 
SET status = 'refunded', updated_at = NOW()
WHERE reference = 'ORDER-1760403565035';
```

---

## 📧 Email Notifications (TODO)

Currently marked as TODO in callback handler:

```javascript
// TODO: Send confirmation email on payment success
// TODO: Send failure notification on payment failure
```

**To Implement:**
1. Use `/src/lib/email.ts` utilities
2. Add email templates
3. Send in callback handler after status update

---

## 🔐 Security Considerations

### **Current Implementation:**
- ✅ Order reference is unique (timestamp-based)
- ✅ Database uses prepared statements (SQL injection prevention)
- ✅ CHIP payment ID stored for verification
- ⚠️ No CHIP signature verification (recommended for production)

### **Recommended for Production:**
1. **Verify CHIP Callback Signature**
   ```javascript
   // Verify that callback actually came from CHIP
   // Check CHIP documentation for signature verification
   ```

2. **Add Order Access Control**
   - Require authentication to view orders
   - Customers can only view their own orders
   - Admin panel for viewing all orders

3. **Rate Limiting**
   - Limit orders per customer per hour
   - Prevent abuse of order creation

---

## 🛠️ Admin Features (Future)

Recommended admin panel features:

1. **Order Management**
   - View all orders
   - Filter by status, date, customer
   - Export orders to CSV
   - Refund orders

2. **Order Details**
   - View full order information
   - Customer details
   - Payment method
   - Order items
   - Status history

3. **Analytics**
   - Total sales
   - Orders by status
   - Popular products
   - Revenue over time

---

## 📝 Example Queries

### Get today's paid orders:
```sql
SELECT * FROM orders 
WHERE status = 'paid' 
  AND DATE(paid_at) = CURDATE()
ORDER BY paid_at DESC;
```

### Get top-selling products:
```sql
SELECT 
  product_name,
  SUM(quantity) as total_sold,
  SUM(subtotal) as total_revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY product_id, product_name
ORDER BY total_sold DESC
LIMIT 10;
```

### Get customer order history:
```sql
SELECT 
  o.reference,
  o.total_amount,
  o.status,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.customer_email = 'customer@example.com'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

---

## 🎉 Summary

**✅ What's Implemented:**
- Complete order database schema
- Automatic order creation on checkout
- Order items storage
- Status updates via CHIP callback
- Order retrieval API

**⏳ TODO:**
- Email notifications
- CHIP signature verification
- Admin panel for order management
- Customer order history page
- Inventory management

---

## 🔗 Related Files

- `/database-schema.sql` - Database schema
- `/src/pages/api/chip/create-payment.ts` - Order creation
- `/src/pages/api/chip/callback.ts` - Status updates
- `/src/pages/api/orders.ts` - Order retrieval
- `/src/lib/db.ts` - Database connection

---

**Need help? Contact: enquiry@kflegacyresources.com**

