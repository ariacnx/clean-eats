# Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Firebase Setup
- [ ] Firestore Database enabled
- [ ] Anonymous authentication enabled (should be on by default)
- [ ] Test that app works locally with Firebase

### 2. Environment Variables
Make sure you have these in your `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ID=clean-eats-app
```

### 3. Build Test
- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`

## 🚀 Deployment Steps

### Method 1: Vercel CLI (Quick)

1. **Login to Vercel:**
   ```bash
   npx vercel login
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Add Environment Variables:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add all your `VITE_FIREBASE_*` variables
   - Redeploy after adding variables

### Method 2: Vercel + GitHub (Recommended - Auto Deploy)

1. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Add Environment Variables:**
   - In Vercel project settings
   - Add all `VITE_FIREBASE_*` variables
   - Save and redeploy

4. **Automatic Deployments:**
   - Every `git push` will auto-deploy
   - No need to run deploy commands manually

## 🔧 Post-Deployment

### 1. Test Your Live Site
- [ ] Visit your Vercel URL
- [ ] Test adding recipes
- [ ] Test favorites
- [ ] Test daily menu
- [ ] Check Firebase console to see data being saved

### 2. Firebase Security Rules (Important!)

Update Firestore rules for production:

1. Go to: https://console.firebase.google.com/project/cleaneats-49351/firestore/rules

2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - users can only read/write their own data
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### 3. Custom Domain (Optional)
- [ ] Add custom domain in Vercel settings
- [ ] Update DNS records
- [ ] SSL certificate auto-provisioned

## 🐛 Troubleshooting

### App stuck on loading screen
- Check browser console for errors
- Verify Firestore is enabled
- Check environment variables are set correctly

### Data not saving
- Check Firebase console for errors
- Verify Firestore rules allow writes
- Check network tab for failed requests

### Build fails
- Check `npm run build` locally first
- Review Vercel build logs
- Ensure all dependencies are in `package.json`

## 📝 Environment Variables Reference

Add these to Vercel (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | cleaneats-49351.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | cleaneats-49351 |
| `VITE_FIREBASE_STORAGE_BUCKET` | cleaneats-49351.firebasestorage.app |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 1090165644690 |
| `VITE_FIREBASE_APP_ID` | 1:1090165644690:web:8dea6daa742c56a3ab354b |
| `VITE_APP_ID` | clean-eats-app |

## ✅ You're Ready When:

- [x] Code is on GitHub
- [ ] Firestore is enabled
- [ ] Environment variables added to Vercel
- [ ] App deployed and accessible
- [ ] Data saving works on live site
- [ ] Firestore security rules updated

