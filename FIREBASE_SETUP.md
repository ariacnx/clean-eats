# Firebase Setup Instructions

## Error: `auth/configuration-not-found`

This error means **Anonymous Authentication is not enabled** in your Firebase project.

## How to Fix

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/cleaneats-49351/authentication/providers

2. **Enable Anonymous Authentication:**
   - Click on the "Anonymous" provider
   - Toggle it to **Enabled**
   - Click **Save**

3. **Verify Firestore is Enabled:**
   - Go to: https://console.firebase.google.com/project/cleaneats-49351/firestore
   - If you see "Get started", click it and choose "Start in test mode" (we have security rules set up)

4. **Deploy Security Rules:**
   - The `firestore.rules` file in your project should be deployed
   - In Firebase Console → Firestore → Rules tab
   - Copy the contents of `firestore.rules` and paste them there
   - Click **Publish**

## After Enabling

1. **Refresh your browser** - The app should now connect to Firebase
2. **Check the console** - You should see: `✅ Firebase authenticated: [user-id]`
3. **Test creating a menu** - It should save to Firebase now

## What Happens Without Firebase?

The app will still work using **localStorage** as a fallback:
- ✅ You can create menus
- ✅ Menus are saved locally
- ❌ Menus won't sync across devices
- ❌ Menus won't persist if you clear browser data

## Environment Variables

Make sure these are set in your `.env` file (for local) and Vercel (for production):

```
VITE_FIREBASE_API_KEY=AIzaSyClJhVmZXgaWy8aEtpFJA3A1wEe3S13jwM
VITE_FIREBASE_AUTH_DOMAIN=cleaneats-49351.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cleaneats-49351
VITE_FIREBASE_STORAGE_BUCKET=cleaneats-49351.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1090165644690
VITE_FIREBASE_APP_ID=1:1090165644690:web:8dea6daa742c56a3ab354b
```

