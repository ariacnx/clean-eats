# Firestore Rules Deployment Guide

## ⚠️ Important: Rules Don't Auto-Sync!

Firestore security rules **do NOT automatically sync** with your code. You must manually deploy them to Firebase Console.

## How to Deploy Firestore Rules

### Method 1: Firebase Console (Easiest)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/cleaneats-49351/firestore/rules

2. **Copy Rules:**
   - Open `firestore.rules` file in your project
   - Copy all the contents

3. **Paste and Publish:**
   - Paste the rules into the Firebase Console editor
   - Click **"Publish"** button
   - Wait for confirmation that rules are deployed

### Method 2: Firebase CLI (Advanced)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Current Rules (for reference)

The `firestore.rules` file contains:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // SHARED RECIPES - Anyone can read, anyone can write (no auth needed)
    match /artifacts/{appId}/sharedRecipes/{recipeId} {
      allow read: if true;
      allow write: if true;
    }

    // MENUS - Public access by menu ID (no auth needed)
    match /artifacts/{appId}/menus/{menuId} {
      allow read: if true;
      allow write: if true;
    }

    // SPACES - Public access by space ID (no auth needed)
    match /artifacts/{appId}/spaces/{spaceId} {
      allow read: if true;
      allow write: if true;
      
      // Space data (current menu, etc.)
      match /data/{document=**} {
        allow read: if true;
        allow write: if true;
      }
      
      // Space menus
      match /menus/{menuId} {
        allow read: if true;
        allow write: if true;
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Troubleshooting

### Error: "Permission denied" when creating space

This means the Firestore rules haven't been deployed yet. Follow the steps above to deploy them.

### Rules not taking effect

1. Wait a few seconds after publishing (rules can take 10-30 seconds to propagate)
2. Refresh your browser/app
3. Check Firebase Console → Firestore → Rules to verify they're published
4. Check browser console for specific error codes

### Testing Rules

After deploying, test by:
1. Creating a new space in the app
2. Checking Firebase Console → Firestore → Data to see if the space document was created
3. If it fails, check the browser console for the exact error

## Security Note

⚠️ **Current rules allow public read/write access** - This is intentional for the space-based system where anyone with a space ID can access it. If you want to add authentication later, you'll need to update the rules accordingly.

