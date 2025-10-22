# Admin Login System

## Overview
Professional admin login system with Argon2id encryption and secure session management.

## Credentials
- **Username**: `administrator@root`
- **Password**: `S0m3b0dy!984`

## Security Features
1. **Argon2id Hashing**: Industry-standard password hashing with salt
   - Memory Cost: 64 MB (65536 KiB)
   - Time Cost: 3 iterations
   - Parallelism: 4 threads
   - Salt Length: 16 bytes

2. **Session Management**:
   - Unique 64-character hex session hash
   - 24-hour session expiration
   - Automatic cleanup of expired sessions

3. **Security Measures**:
   - Timing attack prevention (1-second delay on failed login)
   - Password visibility toggle
   - Secure session verification
   - Protected dashboard routes

## Routes

### Public Routes
- `/admin/login` - Admin login page

### Protected Routes
- `/auth/{hash}` - Admin dashboard (requires valid session hash)

## API Endpoints

### POST /api/auth/login
Login with username and password.

**Request:**
```json
{
  "username": "administrator@root",
  "password": "S0m3b0dy!984"
}
```

**Response (Success):**
```json
{
  "success": true,
  "hash": "64-character-hex-session-hash",
  "message": "Login successful"
}
```

**Response (Error):**
```json
{
  "message": "Invalid credentials"
}
```

### GET /api/auth/verify?hash={sessionHash}
Verify session validity.

**Response (Valid):**
```json
{
  "valid": true,
  "username": "administrator@root",
  "createdAt": "2025-10-14T08:21:01.000Z"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid or expired session"
}
```

### POST /api/auth/logout
Logout and invalidate session.

**Request:**
```json
{
  "hash": "session-hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Design Features

### Login Page
- Modern gradient background (purple to violet)
- Clean white card with rounded corners
- Professional header with logo
- Smooth animations and hover effects
- Password visibility toggle
- Loading states
- Error alerts
- Responsive design

### Dashboard
- Top navigation with user info and logout
- Welcome card
- 4 colorful stats cards:
  - Total Orders (purple gradient)
  - Products (pink gradient)
  - Quotations (blue gradient)
  - Revenue (green gradient)
- Quick actions section
- Session info card with encryption details

## Flow
1. User visits `/admin/login`
2. Enters credentials
3. System verifies using Argon2id
4. Generates unique session hash
5. Redirects to `/auth/{hash}`
6. Dashboard verifies session on load
7. User can logout to invalidate session

## Production Notes
- Store credentials in database instead of hardcoded
- Use Redis or database for session storage
- Implement rate limiting
- Add 2FA for extra security
- Use HTTPS in production
- Set secure cookie flags
- Implement CSRF protection

