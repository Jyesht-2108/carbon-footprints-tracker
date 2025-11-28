# Firebase Authentication Troubleshooting 🔧

## "Signup Failed" Error - Quick Fix

### Most Common Cause: Placeholder Firebase Config

Your `.env` file still has placeholder values. You need to replace them with **real Firebase credentials**.

---

## Step-by-Step Fix

### 1. Go to Firebase Console
Open: https://console.firebase.google.com/

### 2. Select Your Project
Click on your "carbon-nexus" project (or create one if you haven't)

### 3. Get Your Firebase Config

#### Option A: If you already created a web app
1. Click ⚙️ (Settings) → "Project settings"
2. Scroll down to "Your apps"
3. You should see your web app
4. Click on it to see the config

#### Option B: If you haven't created a web app yet
1. Click ⚙️ (Settings) → "Project settings"
2. Scroll down to "Your apps"
3. Click the Web icon `</>`
4. Register app with nickname: "Carbon Nexus Web"
5. Copy the config object

### 4. Copy Your Real Config

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "carbon-nexus-12345.firebaseapp.com",
  projectId: "carbon-nexus-12345",
  storageBucket: "carbon-nexus-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### 5. Update Your .env File

Open `carbon-footprint/frontend-ui/.env` and replace the placeholder values:

**BEFORE (Wrong - Placeholders):**
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**AFTER (Correct - Real Values):**
```env
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=carbon-nexus-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carbon-nexus-12345
VITE_FIREBASE_STORAGE_BUCKET=carbon-nexus-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

### 6. Restart Your Dev Server

**Important:** You MUST restart the dev server after changing `.env`

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 7. Try Signing Up Again

1. Refresh the page
2. Fill in the signup form
3. Click "Sign Up"
4. Should work now! 🎉

---

## Other Common Issues

### Issue: "Firebase Email/Password authentication is not enabled"

**Solution:**
1. Go to Firebase Console
2. Click "Authentication" in sidebar
3. Click "Get started" (if first time)
4. Click "Sign-in method" tab
5. Click "Email/Password"
6. Toggle "Enable" to ON
7. Click "Save"

### Issue: "Firebase configuration error. Please check your API key"

**Solution:**
- Your API key is wrong or missing
- Double-check you copied the correct value from Firebase Console
- Make sure there are no extra spaces or quotes
- Restart dev server after fixing

### Issue: Still getting "Signup failed" with no details

**Solution:**
1. Open browser console (F12)
2. Look for red error messages
3. The error will show the exact problem
4. Common errors:
   - `auth/invalid-api-key` → Wrong API key
   - `auth/configuration-not-found` → Email auth not enabled
   - `auth/network-request-failed` → Internet connection issue

---

## Verification Checklist

Before trying to sign up, verify:

- [ ] Firebase project is created
- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] Web app is registered in Firebase project
- [ ] All 6 Firebase config values are copied to `.env`
- [ ] No placeholder values remain (no "your-api-key-here")
- [ ] Dev server was restarted after editing `.env`
- [ ] Browser page was refreshed

---

## Quick Test

### Test Your Firebase Config

1. Open browser console (F12)
2. Go to Console tab
3. Type:
   ```javascript
   console.log(import.meta.env.VITE_FIREBASE_API_KEY)
   ```
4. Press Enter
5. Should show your actual API key (not "your-api-key-here")
6. If it shows "undefined" or placeholder → Config not loaded

---

## Visual Guide

### Where to Find Firebase Config

```
Firebase Console
└── ⚙️ Settings
    └── Project settings
        └── Scroll down to "Your apps"
            └── Click on your web app (or create one)
                └── See "Firebase SDK snippet"
                    └── Choose "Config"
                        └── Copy the values
```

### What Each Value Looks Like

```
✅ CORRECT:
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                      ↑ Starts with AIzaSy, ~40 characters

✅ CORRECT:
VITE_FIREBASE_AUTH_DOMAIN=carbon-nexus-12345.firebaseapp.com
                          ↑ Your project ID + .firebaseapp.com

✅ CORRECT:
VITE_FIREBASE_PROJECT_ID=carbon-nexus-12345
                         ↑ Your project ID (lowercase, may have numbers)

✅ CORRECT:
VITE_FIREBASE_STORAGE_BUCKET=carbon-nexus-12345.appspot.com
                             ↑ Your project ID + .appspot.com

✅ CORRECT:
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
                                  ↑ Numbers only, ~12 digits

✅ CORRECT:
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
                     ↑ Format: 1:numbers:web:alphanumeric

❌ WRONG:
VITE_FIREBASE_API_KEY=your-api-key-here
                      ↑ This is a placeholder!
```

---

## Still Not Working?

### Check Browser Console

1. Open browser (F12)
2. Go to Console tab
3. Try signing up
4. Look for error messages
5. Share the error message for help

### Common Console Errors

**Error:** `Firebase: Error (auth/invalid-api-key)`
- **Fix:** Wrong API key in `.env`

**Error:** `Firebase: Error (auth/configuration-not-found)`
- **Fix:** Enable Email/Password in Firebase Console

**Error:** `Firebase: Error (auth/network-request-failed)`
- **Fix:** Check internet connection

**Error:** `Cannot read properties of undefined`
- **Fix:** Firebase not initialized, check `.env` values

---

## Need More Help?

### Debug Steps

1. **Verify Firebase Project Exists:**
   - Go to https://console.firebase.google.com/
   - See your project listed

2. **Verify Email Auth is Enabled:**
   - Click your project
   - Click "Authentication"
   - Click "Sign-in method"
   - See "Email/Password" with green checkmark

3. **Verify Web App is Registered:**
   - Click ⚙️ → "Project settings"
   - Scroll to "Your apps"
   - See at least one web app

4. **Verify .env is Correct:**
   - Open `frontend-ui/.env`
   - No placeholder values
   - All 6 Firebase variables present

5. **Verify Dev Server Restarted:**
   - Stop server (Ctrl+C)
   - Start again (`npm run dev`)
   - Refresh browser

---

## Success Indicators

You'll know it's working when:

✅ No error message appears  
✅ "Creating account..." shows briefly  
✅ Automatically redirected to dashboard  
✅ Your name appears in topbar  
✅ User appears in Firebase Console → Authentication → Users  

---

## Example Working .env

```env
# API URLs (keep these as is)
VITE_API_URL=http://localhost:8003
VITE_DATA_CORE_URL=http://localhost:8002
VITE_RAG_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=

# Firebase Config (REPLACE WITH YOUR VALUES)
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuv
VITE_FIREBASE_AUTH_DOMAIN=my-carbon-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-carbon-app
VITE_FIREBASE_STORAGE_BUCKET=my-carbon-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321098
VITE_FIREBASE_APP_ID=1:987654321098:web:abc123def456ghi789
```

---

## Quick Fix Summary

1. ✅ Create Firebase project
2. ✅ Enable Email/Password auth
3. ✅ Register web app
4. ✅ Copy real config values
5. ✅ Paste into `.env` file
6. ✅ Restart dev server
7. ✅ Refresh browser
8. ✅ Try signing up again

**Time needed:** 5 minutes

---

**Still stuck?** Check the browser console (F12) for the exact error message!
