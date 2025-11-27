# Mobile App Deployment Guide

This guide will walk you through deploying Clean Eats as a native mobile app to the iOS App Store and Google Play Store.

## Quick Start

1. **Build your app:**
   ```bash
   npm run build
   npm run cap:sync
   ```

2. **Open in native IDE:**
   - iOS: `npm run cap:ios` (opens Xcode)
   - Android: `npm run cap:android` (opens Android Studio)

## iOS App Store Deployment

### Prerequisites
- macOS computer
- Xcode installed from App Store
- Apple Developer Account ($99/year)
- CocoaPods installed: `sudo gem install cocoapods`

### Step-by-Step

1. **Open the project:**
   ```bash
   npm run cap:ios
   ```

2. **Configure in Xcode:**
   - Select the project in the left sidebar
   - Go to "Signing & Capabilities"
   - Select your Team (Apple Developer account)
   - Xcode will automatically create a provisioning profile

3. **Set Bundle Identifier:**
   - In Xcode, select your project
   - Change Bundle Identifier if needed (currently `com.cleaneats.app`)
   - Make sure it's unique to your organization

4. **Configure App Information:**
   - Open `ios/App/App/Info.plist`
   - Update app name, version, and other metadata
   - Add app icons (see App Icons section below)

5. **Test on Device:**
   - Connect an iPhone/iPad
   - Select your device in Xcode
   - Click Run (▶️)
   - Trust the developer certificate on your device if prompted

6. **Create Archive:**
   - In Xcode: Product → Destination → Any iOS Device
   - Product → Archive
   - Wait for archive to complete

7. **Upload to App Store:**
   - In the Organizer window, click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard to upload

8. **Submit for Review:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Complete app information, screenshots, description
   - Submit for review

### App Icons for iOS

Place your app icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required sizes:
- 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

You can use a tool like [AppIcon.co](https://www.appicon.co) to generate all sizes from one image.

## Google Play Store Deployment

### Prerequisites
- Android Studio installed
- Java Development Kit (JDK) 17+
- Google Play Developer Account ($25 one-time fee)

### Step-by-Step

1. **Open the project:**
   ```bash
   npm run cap:android
   ```

2. **Configure in Android Studio:**
   - Wait for Gradle sync to complete
   - Open `android/app/build.gradle`
   - Update `applicationId` if needed (currently `com.cleaneats.app`)
   - Update `versionCode` and `versionName`

3. **Set App Information:**
   - Open `android/app/src/main/AndroidManifest.xml`
   - Update app name, permissions, etc.

4. **Create Keystore (for signing):**
   ```bash
   cd android/app
   keytool -genkey -v -keystore cleaneats-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cleaneats
   ```
   - Save the keystore file securely!
   - Note the password and alias

5. **Configure Signing:**
   - Create `android/key.properties`:
   ```
   storePassword=your_keystore_password
   keyPassword=your_key_password
   keyAlias=cleaneats
   storeFile=cleaneats-release-key.jks
   ```
   - Add to `.gitignore` to keep it secret!

6. **Update build.gradle for signing:**
   - Edit `android/app/build.gradle`
   - Add signing config (see Android documentation)

7. **Test on Device/Emulator:**
   - Connect Android device or start emulator
   - Click Run in Android Studio
   - Enable USB debugging on device if needed

8. **Generate Release Bundle:**
   - Build → Generate Signed Bundle / APK
   - Choose "Android App Bundle"
   - Select your keystore
   - Choose release build variant
   - Save the `.aab` file

9. **Upload to Play Store:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Upload the `.aab` file
   - Complete store listing, screenshots, description
   - Submit for review

### App Icons for Android

Place your app icons in `android/app/src/main/res/`

Required folders:
- `mipmap-mdpi/` (48x48)
- `mipmap-hdpi/` (72x72)
- `mipmap-xhdpi/` (96x96)
- `mipmap-xxhdpi/` (144x144)
- `mipmap-xxxhdpi/` (192x192)

Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) to generate all sizes.

## Updating Your App

After making changes:

1. **Update version numbers:**
   - iOS: `ios/App/App/Info.plist` - CFBundleShortVersionString
   - Android: `android/app/build.gradle` - versionName and versionCode

2. **Rebuild and sync:**
   ```bash
   npm run build
   npm run cap:sync
   ```

3. **Test in native IDE, then deploy**

## Troubleshooting

### iOS Issues

**"No such module 'Capacitor'"**
- Run: `cd ios/App && pod install`

**Code signing errors:**
- Make sure you selected a Team in Xcode
- Check your Apple Developer account is active

**Build fails:**
- Clean build folder: Product → Clean Build Folder
- Delete DerivedData folder

### Android Issues

**Gradle sync fails:**
- Check Android Studio has latest SDK
- Update Gradle wrapper if needed

**Build errors:**
- Clean project: Build → Clean Project
- Invalidate caches: File → Invalidate Caches / Restart

**App crashes on launch:**
- Check Android logs: `adb logcat`
- Verify Firebase config is set correctly

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Deployment Guide](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Android Deployment Guide](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

