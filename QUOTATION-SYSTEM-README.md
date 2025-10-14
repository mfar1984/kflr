# Quotation Request System - Setup & Testing Guide

## Overview
The quotation request system allows clients to submit requests through the website. The system:
- Saves data to MySQL database
- Sends email to admin (enquiry@kflegacyresources.com)
- Sends confirmation email to client
- Handles file uploads (PDF, PNG, JPEG up to 30MB)
- Shows professional progress modal with percentage counter
- Displays success message after submission

## Database Setup

### 1. Create Database Table
Run the SQL script in `database-schema.sql`:

```bash
mysql -u root -p kflr < database-schema.sql
```

Or manually run:
```sql
CREATE TABLE IF NOT EXISTS `quotation_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `hp_number` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `company_address` TEXT DEFAULT NULL,
  `office_tel` VARCHAR(20) DEFAULT NULL,
  `office_fax` VARCHAR(20) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `question` TEXT NOT NULL,
  `attachment_name` VARCHAR(255) DEFAULT NULL,
  `attachment_size` INT(11) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Verify Database Connection
```bash
mysql -u root -proot -e "USE kflr; SHOW TABLES;"
```

## Configuration

### Database Settings (in `src/lib/db.ts`)
- Host: localhost
- User: root
- Password: root
- Database: kflr

### Email Settings (in `src/lib/email.ts`)
- Host: indigo.herosite.pro
- Port: 587
- Security: TLS
- Email: enquiry@kflegacyresources.com
- Password: F@iz@n!984 (encrypted in code)
- From Name: Enquiry / Request Support KFLR

## Testing the System

### 1. Start the Development Server
```bash
cd kf-next
npm run dev
```

### 2. Navigate to Request Quotation Page
Open: http://localhost:3000/request-quotation

### 3. Fill Out the Form
- **Required fields:**
  - Title (dropdown)
  - First Name
  - Last Name
  - HP Number
  - Email
  - Requirements/Questions

- **Optional fields:**
  - Company Name
  - Company Address
  - Office Tel
  - Office Fax
  - Website
  - Upload Document (PDF, PNG, JPEG - max 30MB)

### 4. Submit and Observe
1. Click "Request Quotation" button
2. Progress modal appears with:
   - Spinning loader
   - Progress bar with percentage (0-100%)
   - "Please wait..." message
3. On success:
   - Success modal with green checkmark
   - "Request Submitted Successfully!" message
   - Confirmation that emails were sent
   - Auto-closes after 5 seconds
4. Form resets automatically

### 5. Verify Database Entry
```bash
mysql -u root -proot -e "USE kflr; SELECT * FROM quotation_requests ORDER BY created_at DESC LIMIT 1;"
```

### 6. Check Emails
- **Admin email** (enquiry@kflegacyresources.com):
  - Subject: "New Quotation Request from [Name]"
  - Contains all form data in formatted HTML
  - Includes attachment if uploaded

- **Client email** (to submitted email address):
  - Subject: "Thank you for your Quotation Request - KF Legacy Resources"
  - Professional thank you message
  - Information about next steps
  - Contact details

## File Upload Storage
Uploaded files are stored in: `public/uploads/`

Make sure this directory has write permissions:
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

## Troubleshooting

### Database Connection Error
- Verify MySQL is running: `mysql.server status`
- Check credentials in `src/lib/db.ts`
- Ensure database 'kflr' exists: `mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS kflr;"`

### Email Not Sending
- Verify email server settings in `src/lib/email.ts`
- Check firewall allows port 587
- Test SMTP connection manually

### File Upload Error
- Check `public/uploads/` directory exists and is writable
- Verify file size is under 30MB
- Ensure file type is PDF, PNG, or JPEG

### Progress Modal Not Showing
- Check browser console for JavaScript errors
- Verify Bootstrap CSS/JS is loaded
- Clear browser cache

## Security Features
- ✅ Password encryption (bcryptjs)
- ✅ reCAPTCHA v3 integration
- ✅ File type validation
- ✅ File size limits (30MB)
- ✅ SQL injection protection (prepared statements)
- ✅ XSS protection (HTML escaping)

## API Endpoint
**POST** `/api/quotation`

**Content-Type:** `multipart/form-data`

**Fields:**
- title, firstName, lastName, hpNumber, email (required)
- companyName, companyAddress, officeTel, officeFax, website (optional)
- question (required)
- document (file, optional)
- g-recaptcha-token (auto-generated)

**Response:**
```json
{
  "success": true,
  "message": "Quotation request submitted successfully"
}
```

## Production Deployment Notes
1. Change database credentials
2. Update email password encryption
3. Enable HTTPS for email security
4. Set up proper file upload limits in server config
5. Configure backup for uploads directory
6. Set up email delivery monitoring
7. Add rate limiting to API endpoint
8. Enable database connection pooling optimization

## Support
For issues or questions, contact: enquiry@kflegacyresources.com

