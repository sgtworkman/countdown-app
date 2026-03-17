# DaysPop — Deploy to App Store

## Prerequisites
- macOS with Xcode installed
- Apple Developer account (developer.apple.com)
- App already set up in App Store Connect (Bundle ID: com.dayspop.app)

## Step 1: Generate the Xcode Project

The app is built with Expo/React Native. You must generate the native iOS project before building.

**IMPORTANT:** The project path contains spaces, so prebuild must be done from a clean path.

```bash
# Copy project to a path without spaces
rm -rf /tmp/dayspop-build
rsync -a "~/Desktop/_Organized/Applications/App Suite/apps/countdown-app/" /tmp/dayspop-build/ --exclude node_modules
cd /tmp/dayspop-build
npm install

# Generate the iOS project
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo prebuild --platform ios --clean

# Copy the ios/ folder back
rsync -a /tmp/dayspop-build/ios/ "~/Desktop/_Organized/Applications/App Suite/apps/countdown-app/ios/"
```

## Step 2: Open in Xcode

```bash
open "/Users/glenworkman/Desktop/_Organized/Applications/App Suite/apps/countdown-app/ios/DaysPop.xcworkspace"
```

## Step 3: Build & Archive

1. In Xcode, select **DaysPop** target
2. Set device to **Any iOS Device (arm64)**
3. Make sure **Signing & Capabilities** has your Apple Developer team selected
4. Menu: **Product → Archive**
5. Wait for the archive to build

## Step 4: Upload to App Store

1. When the archive completes, the **Organizer** window opens
2. Select the archive → click **Distribute App**
3. Choose **App Store Connect** → **Upload**
4. Follow the prompts (accept defaults)
5. Wait for upload to complete

## Step 5: Submit for Review

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **DaysPop** → **App Store** tab
3. Click **+ Version or Platform** (or edit current version)
4. Set version to match app.json (currently 1.0.1)
5. Add "What's New" notes (e.g., "Fixed text input visibility bug")
6. Click **Submit for Review**

## Version Bumping

Before each new build, update these in `app.json`:
- `version` — the user-facing version (e.g., "1.0.1" → "1.0.2")
- `ios.buildNumber` — increment for each upload (e.g., "2" → "3")
- `android.versionCode` — increment for Android builds

Then re-run the prebuild steps above.

## PWA / Web App Updates

The web version is in `dist/` and deployed to Cloudflare Pages. Changes to the React Native code don't affect the PWA — they are separate codebases.
