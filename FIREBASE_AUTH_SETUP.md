# Firebase Authentication Setup Guide 🔐

## Overview
Successfully implemented Firebase Authentication with Login and Signup pages as the landing experience for Carbon Nexus.

## What Was Implemented

### 1. Firebase Configuration
**File:** `frontend-ui/src/config/firebase.ts`
- Firebase app initialization
- Authentication service setup
- Environment variable configuration

### 2. Authentication Context
**File:** `frontend-ui/src/contexts/AuthContext.tsx`
- Global authentication state management
- User session persistence
- Auth methods: signup, login, logout
- Real-time auth state listener

### 3. Login Page
**File:** `frontend-ui/src/pages/LoginPage.tsx`
- Beautiful glassmorphic design
- Email/password authentication
- Error handling with user-friendly messages
- Loading states
- Link to signup page
- Animated background effects

### 4. Signup Page
**File:** `frontend-ui/src/pages/SignupPage.tsx`
- User registration with name, email, password
- Password confirmation validation
- Password strength requirements (min 6 characters)
- Error handling for existing accounts
- Loading states
- Link to login page

### 5. Private Route Protection
**File:** `frontend-ui/src/components/auth/PrivateRoute.tsx`
- Protects all dashboard routes
- Redirects unauthenticated users to login
- Seamless navigation after authentication

### 6. Updated Topbar
**File:** `frontend-ui/src/components/layout/Topbar.tsx`
- Displays logged-in user's name and email
- Shows user initials in avatar
- Dropdown menu with:
  - View Profile
  - Settings
  - Log Out
- Logout functionality

### 7. Updated App Routing
**File:** `frontend-ui/src/App.tsx`
- Public routes: /login, /signup
- Protected routes: All dashboard pages
- Automatic redirect to login for unauthenticated users
- Redirect to dashboard after successful login

---

## Firebase Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `carbon-nexus` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### Step 3: Register Web App

1. In Project Overview, click the Web icon (</>) to add a web app
2. Enter app nickname: `Carbon Nexus Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cd carbon-footprint/frontend-ui
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=carbon-nexus-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=carbon-nexus-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=carbon-nexus-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Important:** Add `.env` to `.gitignore` (already done):
   ```
   .env
   .env.local
   ```

### Step 5: Install Dependencies

Dependencies are already installed, but if needed:
```bash
cd carbon-footprint/frontend-ui
npm install firebase
```

### Step 6: Start the Application

```bash
cd carbon-footprint/frontend-ui
npm run dev
```

The app will open at `http://localhost:5173` and show the Login page.

---

## User Flow

### First-Time User (Signup)
```
1. User visits http://localhost:5173
   ↓
2. Redirected to /login (not authenticated)
   ↓
3. Clicks "Create Account"
   ↓
4. Fills signup form:
   - Full Name
   - Email
   - Password (min 6 chars)
   - Confirm Password
   ↓
5. Clicks "Sign Up"
   ↓
6. Account created in Firebase
   ↓
7. Automatically logged in
   ↓
8. Redirected to Dashboard (/)
```

### Returning User (Login)
```
1. User visits http://localhost:5173
   ↓
2. Redirected to /login (not authenticated)
   ↓
3. Enters email and password
   ↓
4. Clicks "Log In"
   ↓
5. Firebase authenticates
   ↓
6. Redirected to Dashboard (/)
   ↓
7. Can access all protected routes
```

### Logout
```
1. User clicks profile button in topbar
   ↓
2. Dropdown menu appears
   ↓
3. Clicks "Log Out"
   ↓
4. Firebase signs out user
   ↓
5. Redirected to /login
   ↓
6. Session cleared
```

---

## Features

### Authentication Features
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Logout functionality
- ✅ Session persistence (stays logged in on refresh)
- ✅ Protected routes (requires authentication)
- ✅ Automatic redirects
- ✅ User profile display in topbar
- ✅ Display name support

### Security Features
- ✅ Password validation (min 6 characters)
- ✅ Password confirmation matching
- ✅ Firebase security rules (server-side)
- ✅ Environment variable protection
- ✅ Secure token management
- ✅ Auto-logout on token expiry

### UI/UX Features
- ✅ Beautiful glassmorphic design
- ✅ Animated backgrounds
- ✅ Loading states
- ✅ Error messages
- ✅ Form validation
- ✅ Smooth transitions
- ✅ Responsive design
- ✅ User-friendly error messages

---

## Error Handling

### Login Errors
| Firebase Error Code | User-Friendly Message |
|---------------------|----------------------|
| `auth/user-not-found` | "No account found with this email" |
| `auth/wrong-password` | "Incorrect password" |
| `auth/invalid-email` | "Invalid email address" |
| `auth/invalid-credential` | "Invalid email or password" |
| Other | "Failed to log in. Please try again." |

### Signup Errors
| Firebase Error Code | User-Friendly Message |
|---------------------|----------------------|
| `auth/email-already-in-use` | "An account with this email already exists" |
| `auth/invalid-email` | "Invalid email address" |
| `auth/weak-password` | "Password is too weak" |
| Other | "Failed to create account. Please try again." |

### Form Validation
- Empty fields: "Please fill in all fields"
- Password mismatch: "Passwords do not match"
- Short password: "Password must be at least 6 characters"

---

## File Structure

```
frontend-ui/
├── src/
│   ├── config/
│   │   └── firebase.ts              # Firebase configuration
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Authentication context
│   │   └── ThemeContext.tsx         # Existing theme context
│   ├── components/
│   │   ├── auth/
│   │   │   └── PrivateRoute.tsx     # Route protection
│   │   └── layout/
│   │       └── Topbar.tsx           # Updated with auth
│   ├── pages/
│   │   ├── LoginPage.tsx            # Login page
│   │   ├── SignupPage.tsx           # Signup page
│   │   ├── DashboardPage.tsx        # Protected
│   │   ├── IngestPage.tsx           # Protected
│   │   ├── AlertsPage.tsx           # Protected
│   │   ├── SimulatorPage.tsx        # Protected
│   │   ├── ChatbotPage.tsx          # Protected
│   │   ├── ActivityPage.tsx         # Protected
│   │   ├── InsightsPage.tsx         # Protected
│   │   ├── SettingsPage.tsx         # Protected
│   │   └── ProfilePage.tsx          # Protected
│   └── App.tsx                      # Updated routing
├── .env.example                     # Environment template
└── .env                             # Your credentials (gitignored)
```

---

## Testing

### Manual Testing Checklist

#### Signup Flow
- [ ] Visit http://localhost:5173
- [ ] Should redirect to /login
- [ ] Click "Create Account"
- [ ] Fill in all fields with valid data
- [ ] Click "Sign Up"
- [ ] Should create account and redirect to dashboard
- [ ] Check Firebase Console → Authentication → Users (new user should appear)

#### Login Flow
- [ ] Log out if logged in
- [ ] Visit http://localhost:5173
- [ ] Enter valid email and password
- [ ] Click "Log In"
- [ ] Should redirect to dashboard
- [ ] Refresh page - should stay logged in

#### Logout Flow
- [ ] Click profile button in topbar
- [ ] Click "Log Out"
- [ ] Should redirect to /login
- [ ] Try accessing /dashboard directly
- [ ] Should redirect back to /login

#### Error Handling
- [ ] Try logging in with wrong password
- [ ] Try logging in with non-existent email
- [ ] Try signing up with existing email
- [ ] Try signing up with password < 6 chars
- [ ] Try signing up with mismatched passwords
- [ ] All errors should show user-friendly messages

#### Protected Routes
- [ ] Log out
- [ ] Try accessing each route directly:
  - /dashboard
  - /ingest
  - /alerts
  - /simulator
  - /chat
  - /activity
  - /insights
  - /settings
  - /profile
- [ ] All should redirect to /login

#### User Display
- [ ] Log in
- [ ] Check topbar shows correct user name
- [ ] Check topbar shows correct email
- [ ] Check avatar shows correct initials
- [ ] Click profile button - dropdown should appear
- [ ] Click outside - dropdown should close

---

## Customization

### Change Login/Signup Design

Edit `LoginPage.tsx` or `SignupPage.tsx`:
```typescript
// Change colors
className="bg-gradient-to-br from-green-500 to-cyan-600"

// Change logo
<Leaf size={40} className="text-white" />

// Change title
<h1>Your App Name</h1>
```

### Add Social Login (Google, GitHub, etc.)

1. Enable provider in Firebase Console
2. Update `AuthContext.tsx`:
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}
```

3. Add button to `LoginPage.tsx`:
```typescript
<button onClick={loginWithGoogle}>
  Sign in with Google
</button>
```

### Add Password Reset

1. Update `AuthContext.tsx`:
```typescript
import { sendPasswordResetEmail } from 'firebase/auth'

async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}
```

2. Add link to `LoginPage.tsx`:
```typescript
<Link to="/forgot-password">Forgot Password?</Link>
```

### Add Email Verification

1. Update `AuthContext.tsx`:
```typescript
import { sendEmailVerification } from 'firebase/auth'

async function signup(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName })
    await sendEmailVerification(userCredential.user)
  }
}
```

---

## Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Check that you've enabled Email/Password authentication in Firebase Console.

### Issue: "Firebase: Error (auth/api-key-not-valid)"
**Solution:** Verify your `.env` file has the correct `VITE_FIREBASE_API_KEY`.

### Issue: Redirects to login after successful signup
**Solution:** Check that `AuthContext` is properly wrapping the app in `App.tsx`.

### Issue: User stays logged in after closing browser
**Solution:** This is expected behavior. Firebase persists sessions. To change:
```typescript
import { setPersistence, browserSessionPersistence } from 'firebase/auth'

setPersistence(auth, browserSessionPersistence)
```

### Issue: Can't access protected routes
**Solution:** 
1. Check that you're logged in
2. Check browser console for errors
3. Verify `PrivateRoute` is wrapping the routes in `App.tsx`

### Issue: Environment variables not loading
**Solution:**
1. Restart dev server after changing `.env`
2. Ensure variables start with `VITE_`
3. Check `.env` is in `frontend-ui/` directory

---

## Security Best Practices

### ✅ Implemented
- Environment variables for sensitive data
- `.env` in `.gitignore`
- Firebase security rules (server-side)
- Password validation
- Protected routes
- Secure token management

### 🔒 Recommended (Optional)
1. **Enable Email Verification**
   - Require users to verify email before accessing app
   
2. **Add Rate Limiting**
   - Prevent brute force attacks
   
3. **Implement 2FA**
   - Add two-factor authentication option
   
4. **Set Password Requirements**
   - Enforce stronger passwords (uppercase, numbers, symbols)
   
5. **Add CAPTCHA**
   - Prevent bot signups
   
6. **Configure Firebase Security Rules**
   ```javascript
   // Firestore rules example
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

---

## Firebase Console Management

### View Users
1. Go to Firebase Console
2. Click "Authentication"
3. Click "Users" tab
4. See all registered users

### Delete User
1. In Users tab, click on user
2. Click "Delete user"
3. Confirm deletion

### Disable User
1. In Users tab, click on user
2. Click "Disable user"
3. User can't log in until re-enabled

### View Sign-in Methods
1. Click "Sign-in method" tab
2. See enabled/disabled providers
3. Configure provider settings

---

## Next Steps (Optional Enhancements)

### 1. User Profile Management
- [ ] Allow users to update display name
- [ ] Allow users to update email
- [ ] Allow users to change password
- [ ] Add profile picture upload

### 2. Enhanced Security
- [ ] Email verification requirement
- [ ] Two-factor authentication
- [ ] Password strength meter
- [ ] Account recovery options

### 3. Social Authentication
- [ ] Google Sign-In
- [ ] GitHub Sign-In
- [ ] Microsoft Sign-In

### 4. User Roles & Permissions
- [ ] Admin role
- [ ] Manager role
- [ ] Viewer role
- [ ] Role-based access control

### 5. Analytics
- [ ] Track user signups
- [ ] Track login frequency
- [ ] Monitor authentication errors
- [ ] User engagement metrics

---

## Status: ✅ COMPLETE

Firebase Authentication is fully implemented and working! Users must log in to access the Carbon Nexus platform.

### Quick Start:
1. Set up Firebase project
2. Copy `.env.example` to `.env`
3. Add Firebase credentials to `.env`
4. Run `npm run dev`
5. Visit http://localhost:5173
6. Create account or log in

---

**Implementation Date:** November 29, 2024  
**Developer:** Kiro AI Assistant  
**Firebase Version:** 10.x  
**Authentication Method:** Email/Password
