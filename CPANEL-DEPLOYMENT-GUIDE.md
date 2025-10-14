# Panduan Deploy Next.js ke cPanel
## Untuk Website: https://www.kflegacyresources.com

> **PENTING**: Ini adalah panduan migration dari website HTML lama ke Next.js baru.  
> Sila backup website existing sebelum proceed!

---

## 🚀 Quick Start untuk kflegacyresources.com

### Langkah Ringkas (5 Steps):

```
1. Update next.config.ts → tambah output: 'export'
2. npm run build → folder 'out' akan terbentuk
3. Backup website lama di cPanel
4. Upload kandungan folder 'out' ke public_html
5. Test website di https://www.kflegacyresources.com
```

### 📦 Pre-Deployment Checklist:

#### 1. **Backup website lama:**
   ```bash
   # Di cPanel File Manager, zip folder public_html
   # Atau gunakan SSH:
   cd ~
   tar -czf backup-kflegacy-$(date +%Y%m%d).tar.gz public_html/
   ```

#### 2. **Backup database** (jika ada):
   - Pergi ke **phpMyAdmin** di cPanel
   - Export database yang terkait dengan kflegacyresources.com
   - Simpan SQL file di komputer anda

#### 3. **Download website lama** (sebagai backup tambahan):
   - Guna FTP atau cPanel File Manager
   - Download keseluruhan folder `public_html`
   - Simpan di komputer untuk emergency rollback

#### 4. **Verify cPanel Access:**
   - URL cPanel: biasanya `https://kflegacyresources.com:2083` atau `https://cpanel.kflegacyresources.com`
   - Pastikan anda ada login credentials
   - Test login dulu sebelum proceed

---

## 🎯 Deployment Step-by-Step untuk kflegacyresources.com

### STEP 1: Setup untuk Static Export

Di komputer anda, buka projek Next.js ini.

**1a. Update `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,  // Better for static hosting
  // If deployed to subfolder, uncomment:
  // basePath: '/subfolder',
};

export default nextConfig;
```

**1b. Build projek:**

```bash
npm run build
```

Output akan ada di folder `out/`. Ini adalah static website siap untuk upload.

### STEP 2: Verify Build Output

Sebelum upload, test dulu di komputer:

```bash
# Test static site locally
npx serve out

# Buka browser: http://localhost:3000
# Test semua pages dan links
```

### STEP 3: Backup Website Lama di cPanel

1. Login ke cPanel kflegacyresources.com
2. Pergi **File Manager**
3. Navigate ke `public_html`
4. Select semua files/folders
5. Klik **Compress** → pilih **ZIP Archive**
6. Namakan: `backup-website-2025-10-13.zip`
7. Download zip file ke komputer anda
8. **ATAU** rename folder: `public_html` → `public_html_backup_20251013`

### STEP 4: Upload Website Baru

**Option A: Upload via File Manager (Recommended untuk beginners)**

1. Di komputer, zip folder `out/` (zip kandungan sahaja, bukan folder `out` sendiri)
2. Di cPanel File Manager, pergi ke `public_html` (pastikan kosong atau sudah backup)
3. Upload zip file
4. Extract zip file
5. Verify ada files: `index.html`, `_next/`, `assets/`, etc.

**Option B: Upload via FTP**

1. Open FileZilla/FTP client
2. Connect menggunakan FTP credentials dari cPanel
3. Navigate ke `public_html`
4. Upload semua files dari folder `out/`
5. Wait until selesai (check progress bar)

### STEP 5: Setup .htaccess untuk Routing

Create/edit `.htaccess` file di `public_html`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Serve files if they exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Route to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript
</IfModule>
```

### STEP 6: Test Website

1. Visit: https://www.kflegacyresources.com
2. Test semua navigation links
3. Test forms (contact, quotation)
4. Test di mobile browser
5. Check console untuk errors (F12 → Console)

✅ **SELESAI!** Website Next.js anda sudah live!

---

## Kaedah 1: Static Export (Paling Mudah - Disyorkan untuk cPanel Biasa)

### Kelebihan
- Tidak perlu Node.js di server
- Boleh host di mana-mana cPanel
- Lebih pantas dan murah

### Kekurangan
- Tidak boleh guna Server-Side Rendering (SSR)
- Tidak boleh guna API Routes
- Tidak boleh guna Dynamic Routes tertentu

### Langkah-langkah:

#### 1. Update `next.config.ts` untuk static export:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Tambah ini
  images: {
    unoptimized: true,  // Perlu untuk static export
  },
  trailingSlash: true,  // Recommended untuk static sites
};

export default nextConfig;
```

#### 2. Build projek:

```bash
npm run build
```

#### 3. Upload ke cPanel (kflegacyresources.com):

Selepas build, folder `out` akan terbentuk. Upload kandungan folder `out` ke cPanel:

##### Cara A: Guna File Manager (Mudah)

1. **Login ke cPanel** kflegacyresources.com
2. Pergi ke **File Manager**
3. Navigate ke `public_html`
4. **PENTING: Backup/rename folder lama dulu:**
   - Rename `public_html` → `public_html_old` (atau zip dulu)
   - Atau buat folder baru `public_html_backup`
   - Pindahkan semua files lama ke backup folder
5. Zip folder `out` dari komputer anda
6. Upload zip file ke `public_html`
7. Extract zip file
8. Pastikan struktur file betul (index.html kena ada di root `public_html`)

##### Cara B: Guna FTP (FileZilla/Cyberduck)

1. Download FTP client (FileZilla recommended)
2. Dapatkan FTP credentials dari cPanel → FTP Accounts
3. Connect ke server
4. Navigate ke `public_html`
5. Backup files lama (download dulu ke komputer)
6. Upload semua files dari folder `out` ke `public_html`

##### Cara C: Testing di Subdomain Dulu (Disyorkan!)

Untuk testing sebelum deploy production:

1. Buat subdomain di cPanel: `test.kflegacyresources.com`
2. Upload files ke folder subdomain (contoh: `public_html/test`)
3. Test semua functionality
4. Bila OK, baru deploy ke main domain

#### 4. Buat file `.htaccess` di `public_html`:

```apache
# Redirect HTTP to HTTPS (optional)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle client-side routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # If file or directory exists, serve it
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Otherwise route to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Compress files
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

## Kaedah 2: Node.js Application (Untuk cPanel dengan Node.js Support)

### Prasyarat
- cPanel mesti ada **Node.js Selector** atau **Node.js** support
- SSH access (optional tapi sangat membantu)

### Langkah-langkah:

#### 1. Periksa sokongan Node.js di cPanel:

1. Login ke cPanel
2. Cari **Setup Node.js App** atau **Node.js Selector**
3. Jika ada, teruskan dengan kaedah ini

#### 2. Setup Node.js Application di cPanel:

1. Buka **Setup Node.js App**
2. Klik **Create Application**
3. Tetapan:
   - **Node.js version**: Pilih versi 18.x atau lebih tinggi
   - **Application mode**: Production
   - **Application root**: `kf-next` (nama folder projek anda)
   - **Application URL**: Domain/subdomain anda
   - **Application startup file**: `server.js`
   - **Passenger log file**: Biarkan default

4. Klik **Create**

#### 3. Upload projek melalui SSH atau File Manager:

**Cara A: Menggunakan SSH (Disyorkan)**

```bash
# Connect to your cPanel via SSH
ssh username@yourdomain.com

# Navigate to your app directory
cd ~/kf-next

# Upload your files (use git clone, scp, or rsync)
# Example with git:
git clone https://github.com/your-repo/kf-next.git .

# Install dependencies
npm install --production

# Build the application
npm run build
```

**Cara B: Menggunakan File Manager**

1. Zip projek anda (exclude `node_modules`, `.next`, `out`)
2. Upload zip ke cPanel File Manager
3. Extract di folder yang betul
4. Gunakan cPanel Terminal untuk run:
   ```bash
   cd ~/kf-next
   npm install --production
   npm run build
   ```

#### 4. Buat file `server.js` di root projek:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

#### 5. Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js"
  }
}
```

#### 6. Restart aplikasi di cPanel:

1. Pergi ke **Setup Node.js App**
2. Klik **Restart** pada aplikasi anda

---

## Kaedah 3: Menggunakan VPS/Cloud Hosting (Kawalan Penuh)

Jika cPanel anda tidak support Node.js dengan baik, pertimbangkan:

### Option A: Cloudways / DigitalOcean / Vultr
- Install Node.js
- Setup PM2 untuk process management
- Setup Nginx sebagai reverse proxy

### Option B: Vercel (Hosting Percuma untuk Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Kelebihan Vercel:
- Dibuat khas untuk Next.js
- CDN global
- SSL automatik
- Percuma untuk personal projects

---

## Troubleshooting

### Error: "Cannot find module 'next'"

```bash
cd ~/kf-next
npm install
```

### Error: Port already in use

Tukar port di `server.js` atau matikan aplikasi lain.

### Static assets tidak load

Pastikan path dalam code menggunakan relative paths:
```tsx
// Betul
<Image src="/assets/img/logo.png" />

// Salah
<Image src="assets/img/logo.png" />
```

### Database connection issues

Update credentials di `.env` atau environment variables di cPanel:

```env
DATABASE_URL=mysql://user:password@localhost:3306/dbname
```

---

## Cadangan Mengikut Keperluan

| Keperluan | Kaedah Disyorkan |
|-----------|------------------|
| Website static sahaja | Kaedah 1 (Static Export) |
| Ada API routes & database | Kaedah 2 (Node.js cPanel) |
| Trafik tinggi | Kaedah 3 (Vercel/VPS) |
| Budget rendah | Kaedah 1 atau Vercel free tier |

---

## ✅ Checklist Deployment untuk kflegacyresources.com

### Sebelum Deploy:
- [ ] Backup website lama (zip `public_html`)
- [ ] Backup database (export dari phpMyAdmin)
- [ ] Test build secara lokal: `npm run build`
- [ ] Periksa folder `out` ada files yang betul
- [ ] Verify semua assets/images load properly locally
- [ ] Test di subdomain dulu (recommended)
- [ ] Pastikan `.htaccess` configured untuk Next.js routing

### Semasa Deploy:
- [ ] Login ke cPanel kflegacyresources.com
- [ ] Rename/backup folder `public_html` existing
- [ ] Upload files dari folder `out` 
- [ ] Extract dan verify file structure
- [ ] Upload `.htaccess` file
- [ ] Check file permissions (755 for folders, 644 for files)

### Selepas Deploy:
- [ ] Test homepage: https://www.kflegacyresources.com
- [ ] Test semua navigation links
- [ ] Test form submission (contact, quotation)
- [ ] Test di mobile browser
- [ ] Verify SSL certificate active (HTTPS working)
- [ ] Check Google Search Console (submit new sitemap)
- [ ] Monitor website speed (GTmetrix/Google PageSpeed)

### Rollback Plan (Jika Ada Masalah):
Jika website baru ada problem, rollback cepat:

1. Pergi ke File Manager
2. Delete atau rename folder `public_html`
3. Rename `public_html_old` → `public_html`
4. Website lama akan active semula dalam beberapa minit

---

## 🔧 Troubleshooting untuk kflegacyresources.com

### Problem 1: "404 Not Found" pada sub-pages

**Punca:** `.htaccess` tidak configured dengan betul atau mod_rewrite tidak enabled.

**Solution:**
```apache
# Pastikan .htaccess ada rule ini:
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Problem 2: Images/CSS tidak load

**Punca:** Path tidak betul atau files tidak uploaded.

**Solution:**
1. Check browser Console (F12) untuk error messages
2. Verify folder `_next/` dan `assets/` uploaded dengan lengkap
3. Check file permissions (folders: 755, files: 644)
4. Pastikan path dalam code menggunakan `/` di depan:
   ```tsx
   // Betul
   <Image src="/assets/img/logo.png" />
   
   // Salah
   <Image src="assets/img/logo.png" />
   ```

### Problem 3: SSL/HTTPS tidak active

**Solution:**
1. Di cPanel, pergi **SSL/TLS Status**
2. Install SSL certificate (Let's Encrypt - FREE)
3. Enable "Force HTTPS Redirect" atau guna `.htaccess` rule di atas

### Problem 4: Website slow atau timeout

**Possible causes:**
- Images terlalu besar
- Too many files
- Server resources rendah

**Solution:**
1. Optimize images sebelum build (gunakan WebP format)
2. Enable caching di `.htaccess` (sudah included dalam guide atas)
3. Consider CDN (Cloudflare free plan)

### Problem 5: Form submission tidak berfungsi

**Punca:** API routes tidak work dalam static export.

**Solution:**
Untuk forms, guna salah satu cara ini:
1. **Formspree** (https://formspree.io) - Free untuk basic usage
2. **EmailJS** (https://www.emailjs.com) - Send email dari client-side
3. **Google Forms** embed
4. Custom PHP script di cPanel (separate dari Next.js app)

### Problem 6: Email quotation system tidak work

Jika projek ini ada quotation system, untuk static export perlu:

1. Create PHP file di cPanel: `/api/send-email.php`
2. Update form untuk POST ke PHP file instead of Next.js API route
3. Atau guna third-party service seperti Formspree

### Problem 7: Changes tidak reflect after upload

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Clear Cloudflare cache (jika guna CDN)
4. Wait 5-10 minutes untuk propagation

---

## 📞 Sokongan

### Untuk masalah deployment:

1. **Check logs:**
   - Browser Console (F12 → Console)
   - cPanel Error Log (Metrics → Errors)
   - File Manager verify files uploaded

2. **Test locally first:**
   ```bash
   npm run build
   npx serve out
   # Test di http://localhost:3000
   ```

3. **Common checks:**
   - [ ] `.htaccess` file exists dan configured
   - [ ] All files dari folder `out/` uploaded
   - [ ] File permissions correct
   - [ ] SSL certificate installed
   - [ ] DNS pointing correctly

### Hubungi support jika perlu:

- Hosting provider support untuk cPanel issues
- SSL certificate issues
- Server resource limits

---

## 📝 Notes untuk kflegacyresources.com

**Kaedah 1 (Static Export)** adalah yang paling sesuai untuk website ini kerana:

✅ Website corporate/showcase  
✅ Tidak perlukan real-time data  
✅ Content mostly static  
✅ Cheaper hosting cost  
✅ Better performance  
✅ Easier maintenance  

**Jika ada keperluan untuk:**
- Dynamic content (database)
- User authentication
- Real-time updates
- Complex API interactions

Then consider **Kaedah 2 (Node.js)** atau host di **Vercel** instead.

---

## 🎉 Selamat! 

Jika anda ikut semua steps di atas, website kflegacyresources.com sepatutnya sudah live dengan Next.js!

Next steps untuk improve:
1. Setup Google Analytics
2. Submit sitemap ke Google Search Console
3. Setup Cloudflare untuk CDN (optional)
4. Monitor uptime dengan UptimeRobot
5. Regular backups (schedule di cPanel)

