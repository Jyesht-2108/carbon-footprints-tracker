# Quick Start - Firebase Authentication 🚀

## 5-Minute Setup

### Step 1: Create Firebase Project (2 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "carbon-nexus"
4. Disable Google Analytics
5. Click "Create project"

### Step 2: Enable Email Authentication (1 minute)
1. Click "Authentication" in sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Toggle "Enable" to ON
6. Click "Save"

### Step 3: Get Firebase Config (1 minute)
1. Click ⚙️ (Settings) → "Project settings"
2. Scroll to "Your apps"
3. Click Web icon (</>)
4. Register app as "Carbon Nexus Web"
5. Copy the config object

### Step 4: Configure Environment (1 minute)
```bash
cd carbon-footprint/frontend-ui
cp .env.example .env
```

Edit `.env` and paste your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=carbon-nexus-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carbon-nexus-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=carbon-nexus-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 5: Start the App
```bash
npm run dev
```

Visit http://localhost:5173 - You'll see the login page!

---

## Test It Out

### Create Your First Account
1. Click "Create Account"
2. Enter:
   - Name: Your Name
   - Email: your@email.com
   - Password: test123 (or any 6+ chars)
   - Confirm Password: test123
3. Click "Sign Up"
4. You're in! 🎉

### Try Logging Out
1. Click your profile button (top-right)
2. Click "Log Out"
3. You're back at login page

### Log Back In
1. Enter your email and password
2. Click "Log In"
3. Welcome back! 🎉

---

## What You Get

✅ **Login Page** - Beautiful glassmorphic design  
✅ **Signup Page** - User registration with validation  
✅ **Protected Routes** - All dashboard pages require login  
✅ **User Display** - Shows name and email in topbar  
✅ **Logout** - Clean session management  
✅ **Session Persistence** - Stay logged in on refresh  
✅ **Error Handling** - User-friendly error messages  

---

## Troubleshooting

**Can't log in?**
- Check Firebase Console → Authentication → Users
- Verify email/password are correct
- Check browser console for errors

**Environment variables not working?**
- Restart dev server after editing `.env`
- Ensure variables start with `VITE_`
- Check `.env` is in `frontend-ui/` folder

**Still having issues?**
- Check `FIREBASE_AUTH_SETUP.md` for detailed guide
- Verify Firebase project is created
- Ensure Email/Password auth is enabled

---

## Next Steps

1. **Customize the design** - Edit `LoginPage.tsx` and `SignupPage.tsx`
2. **Add more auth methods** - Google, GitHub, etc.
3. **Add email verification** - Require verified emails
4. **Set up user roles** - Admin, manager, viewer
5. **Add password reset** - Forgot password flow

---

## Files Created

- ✅ `src/config/firebase.ts` - Firebase setup
- ✅ `src/contexts/AuthContext.tsx` - Auth state
- ✅ `src/pages/LoginPage.tsx` - Login UI
- ✅ `src/pages/SignupPage.tsx` - Signup UI
- ✅ `src/components/auth/PrivateRoute.tsx` - Route protection
- ✅ Updated `src/App.tsx` - Routing with auth
- ✅ Updated `src/components/layout/Topbar.tsx` - User display

---

## Support

Need help? Check these docs:
- `FIREBASE_AUTH_SETUP.md` - Complete setup guide
- `FIREBASE_AUTH_VISUAL_GUIDE.md` - Visual reference
- Firebase Docs: https://firebase.google.com/docs/auth

---

**Status:** ✅ Ready to use!  
**Time to setup:** ~5 minutes  
**Difficulty:** Easy
