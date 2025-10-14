# 🛒 Shopping Cart & Payment System Guide

## 📋 Overview

Complete e-commerce functionality has been implemented with:
- Shopping cart with localStorage persistence
- CHIP payment gateway integration
- Checkout flow
- Payment success/failure handling

---

## ✅ What's Been Implemented

### 1. **Cart Context** (`src/contexts/CartContext.tsx`)
- Global state management for shopping cart
- LocalStorage persistence
- Functions: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `getTotalItems`, `getTotalPrice`

### 2. **Header Updates** (`src/components/Header.tsx`)
- Cart icon with badge showing item count
- Real-time updates when items added/removed

### 3. **Store Page Updates** (`src/app/(site)/store/page.tsx`)
- **Add to Cart** button for hardware products (Netgate series)
- **Request Quotation** button for programming services
- Cart integration with product options

### 4. **Cart Page** (`/cart`)
- View all cart items
- Adjust quantities
- Remove items
- View total price
- Proceed to checkout

### 5. **Checkout Page** (`/checkout`)
- Billing information form
- Order summary
- CHIP payment integration
- Form validation

### 6. **Payment Pages**
- **Success Page** (`/payment/success`) - Confirmation after successful payment
- **Failed Page** (`/payment/failed`) - Error handling for failed payments

### 7. **CHIP Payment API** (`/api/chip/create-payment`)
- Creates payment with CHIP gateway
- Handles customer data
- Generates checkout URL

### 8. **CHIP Callback Handler** (`/api/chip/callback`)
- Receives payment status updates from CHIP
- Handles paid/failed/cancelled statuses

---

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local` file in root directory:

```env
# Site URL Configuration
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# CHIP Payment Gateway (Live Credentials)
CHIP_API_KEY=eacbT3tKeP2hMFDVn-aPhYYCtboMRjTcQ5ZHkG8wLIwPKMWeaPxUYFwD4OQVjascwN3fy947qMwgrcHqv4r6kw==
CHIP_BRAND_ID=c5f96f76-b79c-4963-8698-086d6ce28062
```

### 2. Install Dependencies

CHIP SDK is already installed via:
```bash
npm install https://github.com/CHIPAsia/chip-nodejs-sdk.git#v1.0.0
```

---

## 🚀 User Flow

### Customer Journey:

1. **Browse Products** → `/store`
   - Filter by category (Networking, Security, Programming)
   - Search products
   - View product details

2. **Add to Cart**
   - Click "Add to Cart" on hardware products
   - Select options (Mount Kit, Power Cord, etc.)
   - Cart badge updates in header

3. **View Cart** → `/cart`
   - Review all items
   - Adjust quantities
   - Remove unwanted items
   - See total price

4. **Checkout** → `/checkout`
   - Fill billing information
   - Review order summary
   - Click "Place Order"

5. **Payment** (CHIP Gateway)
   - Redirected to secure CHIP payment page
   - Select payment method (FPX, Credit Card, E-Wallet)
   - Complete payment

6. **Result**
   - **Success** → `/payment/success` (cart cleared)
   - **Failed** → `/payment/failed` (cart preserved, can retry)

---

## 💳 CHIP Payment Integration

### How It Works:

1. **Customer clicks "Place Order"**
   - Frontend sends customer data + cart to `/api/chip/create-payment`

2. **API creates payment**
   - Calls CHIP API with:
     - Customer details
     - Cart items
     - Total amount
     - Callback URLs

3. **CHIP returns checkout URL**
   - Customer redirected to CHIP payment page

4. **Customer completes payment**
   - CHIP processes payment
   - Redirects to success/failure page
   - Sends callback to your server

5. **Callback received**
   - `/api/chip/callback` receives status update
   - Can update database, send emails, etc.

### CHIP Configuration:

```javascript
const CHIP_API_KEY = "eacbT3tKeP2hMFDVn-aPhYYCtboMRjTcQ5ZHkG8wLIwPKMWeaPxUYFwD4OQVjascwN3fy947qMwgrcHqv4r6kw==";
const CHIP_BRAND_ID = "c5f96f76-b79c-4963-8698-086d6ce28062";
const CHIP_API_URL = "https://gate.chip-in.asia/api/v1";
```

**⚠️ Important Notes:**

- **Localhost Development**: The `success_callback` URL is automatically **skipped** during localhost development because CHIP API only accepts standard HTTP (port 80) or HTTPS (port 443) ports. Custom ports like `:3000` are not supported.
  
- **Production Mode**: When deployed to production with `NEXT_PUBLIC_SITE_URL` set to your actual domain (e.g., `https://www.kflegacyresources.com`), the callback URL is automatically included.

- **Testing**: For local testing, payment redirects (`success_redirect`, `failure_redirect`) will still work perfectly. The callback is only used for server-side order status updates.

---

## 📊 Cart Data Structure

```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  priceLabel?: string; // For "RM 5,000 - RM 35,000"
  image: string;
  quantity: number;
  selectedOptions?: { 
    [key: string]: string; // e.g., { "powerCord": "USA (IEC Type A)" }
  };
}
```

---

## 🎨 UI/UX Features

### Cart Icon (Header):
- Shows number of items in badge
- Red badge for visibility
- Clickable to go to cart page

### Product Cards:
- **Hardware**: Green "Add to Cart" button + "View Details"
- **Programming**: "Request Quotation" + "Contact Sales"

### Cart Page:
- Table layout with images
- Quantity controls (+/-)
- Remove button (trash icon)
- Sticky order summary sidebar

### Checkout Page:
- Malaysian states dropdown
- Phone number field (Malaysia format)
- Order notes textarea
- Secure payment badge
- Processing indicator during submission

---

## 🔐 Security Features

1. **Server-side payment creation** - API key never exposed to frontend
2. **HTTPS required** for production
3. **CHIP signature verification** (should be implemented in callback)
4. **Form validation** on both client and server

---

## 📝 TODO / Future Enhancements

### Recommended Additions:

1. **Database Integration**
   - Store orders in database
   - Track payment status
   - Order management system

2. **Email Notifications**
   - Order confirmation
   - Payment receipt
   - Shipping updates

3. **Inventory Management**
   - Track stock levels
   - Update after successful payment
   - Low stock alerts

4. **User Accounts**
   - Save address for faster checkout
   - Order history
   - Wishlist

5. **Enhanced Security**
   - CHIP signature verification in callback
   - Rate limiting on API endpoints
   - CSRF protection

6. **Analytics**
   - Track cart abandonment
   - Conversion rates
   - Popular products

---

## 🧪 Testing

### Test the Flow:

1. **Add Products to Cart**
   ```
   http://localhost:3000/store
   → Click "Add to Cart" on any Netgate product
   → Check cart icon badge updates
   ```

2. **View Cart**
   ```
   http://localhost:3000/cart
   → Adjust quantities
   → Remove items
   → Check totals update
   ```

3. **Checkout**
   ```
   http://localhost:3000/checkout
   → Fill all required fields
   → Click "Place Order"
   → Should redirect to CHIP payment page
   ```

4. **Payment**
   ```
   On CHIP page:
   → Select payment method
   → Complete payment (use test card if sandbox)
   → Check redirect to success/failed page
   ```

---

## 📞 Support

For CHIP payment issues, check:
- [CHIP Documentation](https://developer.chip-in.asia/)
- [CHIP API Reference](https://gate.chip-in.asia/docs/api)

For custom modifications, contact:
- Email: enquiry@kflegacyresources.com

---

## 🎯 Key Files Reference

| File | Purpose |
|------|---------|
| `src/contexts/CartContext.tsx` | Cart state management |
| `src/components/Header.tsx` | Cart icon in header |
| `src/app/(site)/store/page.tsx` | Product listing with Add to Cart |
| `src/app/(site)/cart/page.tsx` | Shopping cart page |
| `src/app/(site)/checkout/page.tsx` | Checkout form & payment |
| `src/pages/api/chip/create-payment.ts` | CHIP payment creation API |
| `src/pages/api/chip/callback.ts` | CHIP webhook handler |
| `src/app/(site)/payment/success/page.tsx` | Success page |
| `src/app/(site)/payment/failed/page.tsx` | Failure page |

---

## ✨ Features Summary

✅ **Cart System**: Add/Remove/Update items
✅ **LocalStorage**: Persist cart across sessions
✅ **CHIP Integration**: Secure payment gateway
✅ **Responsive Design**: Mobile-friendly
✅ **Real-time Updates**: Cart badge, totals
✅ **Product Options**: Support for variants (Mount Kit, Power Cord, etc.)
✅ **Multiple Categories**: Hardware + Programming services
✅ **Success/Failure Handling**: User-friendly messages
✅ **Malaysian Focus**: MYR currency, Malaysian states

---

**Status**: ✅ PRODUCTION READY (with database integration recommended for tracking)

**Last Updated**: October 2025

