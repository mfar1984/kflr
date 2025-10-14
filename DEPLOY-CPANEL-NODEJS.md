# 🚀 Deployment Guide: cPanel Node.js untuk kflegacyresources.com

## ✅ Status: READY FOR DEPLOYMENT

Build successful dengan:
- ✅ 36 pages generated
- ✅ 2 API routes (/api/health, /api/quotation)
- ✅ Database integration ready
- ✅ All dependencies installed

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Di Komputer (Local)

- [x] Build successful (`npm run build`)
- [x] Dependencies installed (mysql2, nodemailer, formidable)
- [x] server.js created
- [x] Database credentials configured
- [ ] Test local production build
- [ ] Backup projek (zip entire folder)

### Di cPanel

- [ ] Node.js App Selector available
- [ ] MySQL database created: `kflegacy_kflegacyresoruces`
- [ ] Database user configured
- [ ] Database imported (database-schema.sql)
- [ ] SSH access (optional but recommended)

---

## 🎯 DEPLOYMENT METHOD 1: Using cPanel File Manager + Terminal

### STEP 1: Prepare Files di Local

1. **Buat file `.env` dari template:**
   ```bash
   # Di folder projek, rename file:
   # ENV-PRODUCTION.txt → .env
   ```

2. **Zip projek (EXCLUDE beberapa folder):**
   
   **Exclude these:**
   - `node_modules/` (akan install di server)
   - `.next/` (akan build di server)
   - `.git/` (optional)
   
   **Include these:**
   - `src/`
   - `public/`
   - `package.json`
   - `package-lock.json`
   - `server.js`
   - `next.config.ts`
   - `tsconfig.json`
   - `.env` (PENTING!)
   - `database-schema.sql`
   - Semua config files

   ```bash
   # Di terminal, dari folder projek:
   zip -r kf-next-deploy.zip . -x "node_modules/*" ".next/*" ".git/*" "out/*"
   ```

### STEP 2: Setup Database di cPanel

1. **Login cPanel kflegacyresources.com**

2. **Verify database exists:**
   - Pergi ke **MySQL Databases**
   - Confirm database: `kflegacy_kflegacyresoruces` exists
   - User: `kflegacy_kflegacyresources` has privileges

3. **Import database schema:**
   - Pergi ke **phpMyAdmin**
   - Select database `kflegacy_kflegacyresoruces`
   - Click **Import**
   - Upload `database-schema.sql`
   - Click **Go**
   - Verify tables created

### STEP 3: Upload Files ke cPanel

1. **Pergi ke File Manager**

2. **Navigate ke folder application** (biasanya):
   - `/home/username/kf-next` (buat folder baru jika perlu)
   - JANGAN upload ke `public_html` untuk Node.js app

3. **Upload zip file:**
   - Click **Upload**
   - Select `kf-next-deploy.zip`
   - Wait until complete

4. **Extract zip:**
   - Right-click zip file → **Extract**
   - Extract to current directory
   - Delete zip file after extraction

5. **Verify structure:**
   ```
   /home/username/kf-next/
   ├── src/
   ├── public/
   ├── package.json
   ├── server.js
   ├── .env
   └── ...
   ```

### STEP 4: Setup Node.js Application di cPanel

1. **Pergi ke "Setup Node.js App"**

2. **Click "Create Application"**

3. **Configure:**
   ```
   Node.js Version: 18.x atau 20.x (pilih latest LTS)
   Application Mode: Production
   Application Root: kf-next
   Application URL: kflegacyresources.com (atau www.kflegacyresources.com)
   Application Startup File: server.js
   Passenger Log File: (leave default)
   ```

4. **Click "Create"**

### STEP 5: Install Dependencies di Server

**Option A: Using cPanel Terminal**

1. Pergi ke **Terminal** di cPanel
2. Run commands:
   ```bash
   cd ~/kf-next
   npm install --production
   ```

**Option B: Using SSH** (if available)

1. SSH to server:
   ```bash
   ssh username@kflegacyresources.com
   ```

2. Install dependencies:
   ```bash
   cd ~/kf-next
   npm install --production
   ```

### STEP 6: Build Application di Server

```bash
cd ~/kf-next
npm run build
```

Wait for build to complete (~2-5 minutes).

### STEP 7: Setup Environment Variables (Alternative Method)

Jika `.env` file tidak work, set environment variables di cPanel Node.js App:

1. Pergi ke **Setup Node.js App**
2. Click **Edit** pada application
3. Scroll ke **Environment Variables**
4. Add each variable:
   ```
   DB_HOST = localhost
   DB_USER = kflegacy_kflegacyresources
   DB_PASSWORD = L2iPxADRAjNMdXiMhO
   DB_NAME = kflegacy_kflegacyresoruces
   NODE_ENV = production
   PORT = 3000
   ```

### STEP 8: Start/Restart Application

1. Di **Setup Node.js App**, click **Restart**
2. Wait for status: "Running"
3. Check application URL

---

## 🎯 DEPLOYMENT METHOD 2: Using Git (Recommended for Updates)

### Initial Setup

1. **Di cPanel Terminal atau SSH:**
   ```bash
   cd ~
   git clone https://github.com/your-repo/kf-next.git
   cd kf-next
   ```

2. **Create `.env` file:**
   ```bash
   nano .env
   ```
   
   Paste:
   ```
   DB_HOST=localhost
   DB_USER=kflegacy_kflegacyresources
   DB_PASSWORD=L2iPxADRAjNMdXiMhO
   DB_NAME=kflegacy_kflegacyresoruces
   NODE_ENV=production
   PORT=3000
   ```
   
   Save: `Ctrl+X`, `Y`, `Enter`

3. **Install & Build:**
   ```bash
   npm install --production
   npm run build
   ```

4. **Setup Node.js App** (same as Method 1, Step 4)

### For Future Updates

```bash
cd ~/kf-next
git pull
npm install --production
npm run build
# Restart app di cPanel UI
```

---

## 🔧 POST-DEPLOYMENT

### 1. Test Application

Visit: https://www.kflegacyresources.com

Test:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] All pages accessible
- [ ] Images loading
- [ ] Forms display correctly

### 2. Test API Routes

**Test Health Check:**
```bash
curl https://www.kflegacyresources.com/api/health
```

Should return: `{"status":"ok"}`

**Test Quotation Form:**
- Go to: https://www.kflegacyresources.com/request-quotation
- Fill form
- Submit
- Check if email received

### 3. Check Logs

Di cPanel:
- **Setup Node.js App** → View **Passenger Log**
- Check for errors

### 4. Setup Domain (if not automatic)

Di cPanel:
1. **Domains** → Setup domain pointing
2. **SSL/TLS** → Install Let's Encrypt certificate
3. Force HTTPS redirect

---

## ⚠️ TROUBLESHOOTING

### Problem 1: Application Won't Start

**Check:**
```bash
cd ~/kf-next
npm run build
# Check for errors
```

**Solution:**
- Verify all dependencies installed: `npm list`
- Check Node.js version matches: `node -v`
- Check logs in Passenger Log

### Problem 2: Database Connection Error

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Verify credentials in `.env`
2. Check database user privileges in cPanel MySQL
3. Test connection:
   ```bash
   mysql -u kflegacy_kflegacyresources -p kflegacy_kflegacyresoruces
   # Enter password when prompted
   ```

### Problem 3: 502 Bad Gateway

**Possible causes:**
- Application crashed
- Port conflict
- Memory limit

**Solution:**
1. Restart application in cPanel
2. Check error logs
3. Increase memory limit if needed

### Problem 4: Static Files (images/css) Not Loading

**Solution:**
1. Verify `public/` folder uploaded
2. Check file permissions (755 for folders, 644 for files)
3. Check browser console for 404 errors

### Problem 5: Form Submission Not Working

**Check:**
1. Email credentials configured in `.env`
2. Test email sending:
   ```bash
   curl -X POST https://www.kflegacyresources.com/api/quotation \
     -F "name=Test" \
     -F "email=test@test.com"
   ```

### Problem 6: Port Already in Use

**Solution:**
- cPanel automatically assigns ports
- Don't manually set PORT in Node.js app config
- Let cPanel handle it

---

## 📊 MONITORING

### Check Application Status

```bash
# SSH to server
cd ~/kf-next

# Check if running
ps aux | grep node

# Check memory usage
top -u username

# Check disk space
df -h
```

### View Real-time Logs

```bash
tail -f ~/kf-next/logs/app.log
# Or check Passenger Log in cPanel
```

---

## 🔄 UPDATE WORKFLOW

Untuk future updates:

1. **Local development:**
   ```bash
   # Make changes
   npm run dev
   # Test locally
   
   # Commit changes
   git add .
   git commit -m "Update description"
   git push
   ```

2. **Deploy to production:**
   ```bash
   # SSH to server
   cd ~/kf-next
   git pull
   npm install --production
   npm run build
   
   # Restart via cPanel UI
   ```

---

## 📝 IMPORTANT FILES

```
kf-next/
├── server.js              ← Production server
├── .env                   ← Environment variables (SENSITIVE!)
├── package.json           ← Dependencies
├── database-schema.sql    ← Database schema
├── ENV-PRODUCTION.txt     ← Template for .env
└── src/
    ├── lib/
    │   ├── db.ts         ← Database connection
    │   └── email.ts      ← Email service
    └── pages/api/
        ├── health.ts      ← Health check endpoint
        └── quotation.ts   ← Quotation API
```

---

## 🎉 SUCCESS CRITERIA

Application is successfully deployed when:

- ✅ Website accessible via https://www.kflegacyresources.com
- ✅ All pages load without errors
- ✅ Database connection working
- ✅ Forms submit successfully
- ✅ Emails sent from quotation form
- ✅ No errors in Passenger Log
- ✅ SSL certificate active (HTTPS)
- ✅ Performance acceptable (< 3s page load)

---

## 📞 SUPPORT

### Common Resources

- **cPanel Documentation:** https://docs.cpanel.net/
- **Node.js on cPanel:** Search for "cPanel Node.js Application" in help
- **Next.js Docs:** https://nextjs.org/docs

### Get Help

1. Check Passenger Log for errors
2. Check browser console (F12)
3. Contact hosting support for cPanel/server issues
4. Check Next.js GitHub issues for framework bugs

---

## 🔐 SECURITY CHECKLIST

Before going live:

- [ ] `.env` file permissions: 600 (chmod 600 .env)
- [ ] Database password strong
- [ ] SSL certificate installed
- [ ] Force HTTPS enabled
- [ ] File upload restrictions configured
- [ ] Rate limiting on forms (optional but recommended)
- [ ] Regular backups scheduled
- [ ] Error messages don't expose sensitive info

---

## 💾 BACKUP STRATEGY

### Automated Backups (Recommended)

1. **cPanel Backups:**
   - Enable automatic daily backups in cPanel
   - Download weekly backups to local storage

2. **Database Backups:**
   ```bash
   # Create backup script
   mysqldump -u kflegacy_kflegacyresources -p kflegacy_kflegacyresoruces > backup_$(date +%Y%m%d).sql
   ```

3. **Code Backups:**
   - Use Git for version control
   - Keep production branch separate from development

---

## 🚀 PERFORMANCE OPTIMIZATION

After deployment:

1. **Enable caching** in Next.js config
2. **Optimize images** (already in public/assets)
3. **Use CDN** (Cloudflare free tier)
4. **Monitor response times**
5. **Optimize database queries**
6. **Consider Redis** for session/cache (if available)

---

Selamat Deployment! 🎊

Jika ada masalah, refer to Troubleshooting section atau hubungi hosting support.

