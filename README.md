# Clean Eats - Menu Randomizer

A fun and interactive meal planning app that helps you discover healthy recipes through a slot machine-style randomizer.

## Features

- 🎰 **Slot Machine Randomizer**: Spin to discover random healthy recipes
- ❤️ **Favorites**: Save your favorite recipes for easy access
- 📅 **Daily Menu Planning**: Plan your meals for the day
- 📚 **Browse All Recipes**: Filter recipes by cuisine and protein type
- 💾 **Menu Templates**: Save and load your favorite meal combinations
- 🔥 **Firebase Integration**: Sync your data across devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase (optional but recommended for template saving):
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Get your Firebase configuration
   - Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Mobile App Deployment

Your app is now configured to build as a native mobile app for iOS and Android using Capacitor!

### Prerequisites for Mobile Development

**For iOS:**
- macOS (required)
- Xcode (install from App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account (for App Store deployment)

**For Android:**
- Android Studio (download from [developer.android.com](https://developer.android.com/studio))
- Java Development Kit (JDK) 17 or higher
- Android SDK (installed via Android Studio)
- Google Play Developer Account (for Play Store deployment)

### Building for Mobile

1. **Build your web app:**
```bash
npm run build
```

2. **Sync with native platforms:**
```bash
npm run cap:sync
```

This command builds your app and copies it to the native iOS and Android projects.

### iOS Development

1. **Open in Xcode:**
```bash
npm run cap:ios
```

2. **In Xcode:**
   - Select your development team in Signing & Capabilities
   - Choose a simulator or connected device
   - Click the Play button to run

3. **For App Store deployment:**
   - Product → Archive
   - Upload to App Store Connect
   - Submit for review

### Android Development

1. **Open in Android Studio:**
```bash
npm run cap:android
```

2. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select a device/emulator
   - Click Run button

3. **For Play Store deployment:**
   - Build → Generate Signed Bundle / APK
   - Create a release build
   - Upload to Google Play Console

### Mobile App Configuration

The app is configured in `capacitor.config.ts`. You can customize:
- App ID (currently `com.cleaneats.app`)
- App Name (currently `Clean Eats`)
- Splash screen settings
- Other native features

### Updating Your App

After making changes to your web code:

1. Rebuild:
```bash
npm run build
```

2. Sync to native projects:
```bash
npm run cap:sync
```

3. Reopen in Xcode/Android Studio to test

### Useful Commands

- `npm run cap:sync` - Build and sync web assets to native projects
- `npm run cap:ios` - Open iOS project in Xcode
- `npm run cap:android` - Open Android project in Android Studio
- `npm run cap:copy` - Copy web assets only (faster, no build)
- `npm run cap:update` - Update Capacitor dependencies

## Web Deployment

### Vercel (Recommended - No Installation Needed)

1. Deploy using npx (no global install required):
```bash
npx vercel
```

Or install locally as a dev dependency:
```bash
npm install --save-dev vercel
```

Then deploy:
```bash
npx vercel
```

2. Add environment variables in Vercel dashboard if using Firebase

### Netlify (No Installation Needed)

1. Deploy using npx:
```bash
npx netlify-cli deploy --prod
```

Or install locally:
```bash
npm install --save-dev netlify-cli
npx netlify deploy --prod
```

2. Add environment variables in Netlify dashboard

### Firebase Hosting

1. Use npx (no global install needed):
```bash
npx firebase-tools login
npx firebase-tools init hosting
```

2. Build and deploy:
```bash
npm run build
npx firebase-tools deploy
```

Or install locally:
```bash
npm install --save-dev firebase-tools
npx firebase login
npx firebase init hosting
npm run build
npx firebase deploy
```

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Backend (Firestore & Auth)
- **Lucide React** - Icons
- **Capacitor** - Native mobile app framework

## Project Structure

```
menu app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── ios/                  # iOS native project (generated)
├── android/              # Android native project (generated)
├── dist/                 # Production build output
├── index.html           # HTML template
├── package.json         # Dependencies
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## License

MIT

