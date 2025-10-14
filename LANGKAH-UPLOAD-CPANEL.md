# 📤 Langkah Upload ke cPanel - kflegacyresources.com

## ✅ Status Build: SIAP!

Folder `out/` sudah mengandungi semua files yang perlu diupload.

---

## 🚀 Cara 1: Upload Guna File Manager (PALING MUDAH)

### Step 1: Prepare Files di Komputer

1. **Pergi ke folder projek ini:**
   ```
   /Users/faizan/Downloads/Faizan/Faizan/Programming/KF Legacy Resources/kf-next/out/
   ```

2. **ZIP semua kandungan dalam folder `out/`:**
   - Masuk ke dalam folder `out/`
   - Select SEMUA files dan folders di dalam
   - Right-click → Compress
   - Nama zip: `kf-website-new.zip`
   
   **PENTING:** Jangan zip folder `out/` sendiri! 
   - ✅ BETUL: Zip kandungan DALAM folder `out/`
   - ❌ SALAH: Zip folder `out/` itu sendiri

### Step 2: Backup Website Lama di cPanel

1. **Login ke cPanel:**
   - URL: `https://kflegacyresources.com:2083` (atau check email hosting)
   - Masukkan username & password

2. **Pergi ke File Manager:**
   - Cari icon "File Manager"
   - Click untuk open

3. **Backup folder public_html:**
   - Navigate ke folder `public_html`
   - Select SEMUA files dalam `public_html`
   - Click **Compress** (atas page)
   - Pilih "Zip Archive"
   - Nama: `backup-website-old-13oct2025.zip`
   - Click "Compress Files"
   - Tunggu selesai
   - **Download backup** ke komputer (click file → Download)

4. **Delete files lama:**
   - Selepas backup selamat, select semua files dalam `public_html`
   - Click **Delete**
   - Confirm
   - Pastikan `public_html` kosong sekarang

### Step 3: Upload Website Baru

1. **Dalam File Manager, pastikan anda di folder `public_html`**

2. **Upload zip file:**
   - Click **Upload** (button atas)
   - Click "Select File"
   - Pilih `kf-website-new.zip` yang anda buat tadi
   - Tunggu upload selesai (progress bar)
   - Close upload page bila selesai

3. **Extract zip file:**
   - Kembali ke File Manager
   - Di folder `public_html`, cari file `kf-website-new.zip`
   - Right-click pada zip file → **Extract**
   - Extract path: `/home/username/public_html`
   - Click "Extract Files"
   - Tunggu selesai

4. **Delete zip file:**
   - Select `kf-website-new.zip`
   - Click Delete
   - (Tak perlu zip file lagi)

### Step 4: Verify File Structure

Di `public_html`, pastikan struktur macam ini:

```
public_html/
├── index.html          ← Mesti ada!
├── .htaccess           ← Mesti ada!
├── _next/              ← Folder Next.js assets
├── assets/             ← Images, CSS, etc
├── admin/
├── barcode-rfid/
├── career/
├── contact/
├── favicon.ico
└── (semua folders lain)
```

**PENTING:** File `index.html` mesti terus dalam `public_html`, BUKAN dalam subfolder!

### Step 5: Test Website

1. **Buka browser**
2. **Clear cache** (Ctrl+Shift+Delete atau Cmd+Shift+Delete)
3. **Visit:** https://www.kflegacyresources.com
4. **Test:**
   - ✅ Homepage load?
   - ✅ Navigation menu berfungsi?
   - ✅ Images semua keluar?
   - ✅ Click beberapa pages (About, Services, Contact, etc)
   - ✅ Test di mobile browser

---

## 🚀 Cara 2: Upload Guna FTP (FileZilla)

Jika anda biasa guna FTP:

### Step 1: Setup FTP

1. **Dapatkan FTP credentials dari cPanel:**
   - Login cPanel
   - Cari "FTP Accounts"
   - Atau guna main cPanel username/password

2. **Install FileZilla** (jika belum ada):
   - Download: https://filezilla-project.org
   - Install & open

3. **Connect ke server:**
   - Host: `ftp.kflegacyresources.com` atau server IP
   - Username: (dari cPanel)
   - Password: (dari cPanel)
   - Port: 21
   - Click "Quickconnect"

### Step 2: Backup & Upload

1. **Backup files lama:**
   - Navigate ke `public_html` (right panel)
   - Select all → Right-click → Download
   - Simpan di komputer

2. **Delete files lama:**
   - Select all dalam `public_html`
   - Delete

3. **Upload files baru:**
   - Left panel: Navigate ke folder `out/` di komputer anda
   - Select SEMUA files dalam `out/`
   - Drag & drop ke `public_html` (right panel)
   - Tunggu upload selesai
   - Verify semua files uploaded

---

## ⚠️ Troubleshooting

### Problem: "404 Not Found" bila click links

**Solution:**
- Pastikan file `.htaccess` ada dalam `public_html`
- Check mod_rewrite enabled (contact hosting support)

### Problem: Images tidak keluar

**Solution:**
- Check folder `assets/` uploaded lengkap
- Check browser console (F12 → Console) untuk error
- Verify file permissions (folders: 755, files: 644)

### Problem: CSS/Design tidak cantik

**Solution:**
- Check folder `_next/` uploaded lengkap
- Clear browser cache & hard refresh (Ctrl+F5)
- Check console untuk 404 errors

### Problem: SSL/HTTPS error

**Solution:**
- Di cPanel, pergi "SSL/TLS Status"
- Install SSL certificate (Let's Encrypt - FREE)
- Atau contact hosting support

### Emergency: Rollback Website Lama

Jika ada masalah besar:

1. Pergi File Manager
2. Delete semua dalam `public_html`
3. Upload backup zip yang anda download tadi
4. Extract
5. Website lama akan kembali

---

## 📋 Final Checklist

Sebelum declare SELESAI:

- [ ] Website accessible: https://www.kflegacyresources.com
- [ ] Homepage load dengan design yang betul
- [ ] All navigation links working
- [ ] All images showing
- [ ] Test di mobile browser
- [ ] Test di different browsers (Chrome, Safari, Firefox)
- [ ] No console errors (F12 → Console)
- [ ] HTTPS/SSL active (padlock icon di browser)
- [ ] Forms accessible (walaupun belum berfungsi - kita fix nanti)

---

## ⚠️ NOTE: Form Quotation & Contact

Disebabkan static export, form-form ini **tidak akan submit** lagi melalui API routes.

### Options untuk fix forms:

**Option 1: Guna Formspree (Mudah, FREE)**
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

**Option 2: Guna EmailJS (Client-side)**
- https://www.emailjs.com
- FREE untuk 200 emails/month

**Option 3: Buat PHP handler (Di cPanel)**
- Create file `/api-php/send-email.php`
- Update form untuk POST ke PHP file

Saya boleh bantu setup mana-mana option yang anda pilih SELEPAS website deploy.

---

## 🎉 Tahniah!

Jika semua checklist ✅, website Next.js anda sudah LIVE!

Next steps:
1. Fix forms (pilih option di atas)
2. Setup Google Analytics (optional)
3. Submit sitemap ke Google Search Console
4. Setup Cloudflare untuk CDN (optional)
5. Monitor performance

**Sebarang masalah, rujuk:**
- File: `CPANEL-DEPLOYMENT-GUIDE.md` (guide lengkap)
- Hosting support
- Atau contact IT team

Good luck! 🚀

