# 🚀 Quick Deploy Guide - Build di Local

## Masalah:
Server cPanel ada resource limits, tak boleh build Tailwind v4 di server.

## Solution:
Build di local, upload built files ke server.

---

## 📦 STEP 1: Build di Local (Komputer)

```bash
cd "/Users/faizan/Downloads/Faizan/Faizan/Programming/KF Legacy Resources/kf-next"

# Clean previous builds
rm -rf .next

# Build production
npm run build

# Verify build success
ls -la .next/
```

---

## 📤 STEP 2: Upload Built Files

### Option A: Upload .next folder only (RECOMMENDED)

1. **Compress .next folder:**
   ```bash
   tar -czf next-build.tar.gz .next/
   ```

2. **Upload via cPanel File Manager:**
   - File: `next-build.tar.gz` (16MB)
   - Destination: `~/public_html/v9/`

3. **Extract di server (via SSH/Terminal):**
   ```bash
   cd ~/public_html/v9
   tar -xzf next-build.tar.gz
   rm next-build.tar.gz
   ```

### Option B: Upload via FTP/SFTP

1. Connect FTP ke server
2. Navigate ke `public_html/v9/`
3. Upload folder `.next/` (replace existing)
4. Wait until complete

---

## 🔄 STEP 3: Restart Application

1. Login cPanel
2. **Setup Node.js App**
3. Find application di `v9`
4. Click **RESTART**
5. Wait for status: "Running"

---

## ✅ STEP 4: Test Website

Visit: https://www.kflegacyresources.com

Test:
- Homepage loads
- Navigation works
- Forms display
- No console errors

---

## 🔁 Future Updates Workflow

Setiap kali update code:

```bash
# 1. Make changes di local
# 2. Test: npm run dev

# 3. Build
npm run build

# 4. Compress
tar -czf next-build.tar.gz .next/

# 5. Upload ke server (replace old .next folder)

# 6. Restart app di cPanel
```

---

## ⚠️ IMPORTANT NOTES

- **JANGAN run `npm run build` di server** - akan error EAGAIN
- **ALWAYS build di local** - komputer anda ada cukup resources
- **Only upload `.next` folder** - node_modules dah ada di server
- **Restart app after upload** - untuk load built files yang baru

---

## 🐛 Troubleshooting

### Problem: "Module not found" after restart

**Solution:**
```bash
# Di server, verify node_modules installed
cd ~/public_html/v9
npm install --production
```

### Problem: Changes not reflecting

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Verify .next folder uploaded correctly
4. Restart app again

### Problem: 502 Bad Gateway

**Solution:**
1. Check app status di cPanel
2. View Passenger Log for errors
3. Verify server.js file exists
4. Check environment variables set

---

## 📝 Checklist

Before deploying:
- [ ] Code changes tested locally (npm run dev)
- [ ] Build successful (npm run build)
- [ ] .next folder compressed
- [ ] Uploaded to correct path
- [ ] Extracted successfully
- [ ] App restarted
- [ ] Website tested

---

## 💡 Pro Tip

Untuk automation, boleh guna rsync via SSH:

```bash
# Build di local
npm run build

# Sync .next folder to server
rsync -avz --delete .next/ kflegacy@indigo.herosite.pro:~/public_html/v9/.next/

# Restart via SSH
ssh kflegacy@indigo.herosite.pro "touch ~/public_html/v9/tmp/restart.txt"
```

---

Selamat Deploy! 🎉

