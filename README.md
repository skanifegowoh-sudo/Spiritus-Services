# Enugu Diocese Portal — Mobile App

This folder is a ready-to-build **Capacitor** project. Your existing website
(all the HTML/CSS/JS from `enugu-portal-updated.zip`) sits inside `www/`
unchanged — Capacitor just wraps it in a native shell so it installs and runs
like a real app on Android and iOS.

## What you need locally

- **Node.js** 18 or newer (https://nodejs.org)
- **For Android:** Android Studio (free) — https://developer.android.com/studio
- **For iOS:** a Mac with Xcode (free from the App Store) — Apple does not
  allow building iOS apps on Windows/Linux, this is an Apple restriction, not
  a tooling limitation.

## Steps

1. Unzip this project on your computer.
2. Open a terminal in the project folder.
3. Run:
   ```
   bash setup.sh
   ```
   This installs dependencies and creates the `android/` and `ios/` native
   projects around your site.
4. **Android:** `npm run android` opens the project in Android Studio. From
   there: `Build > Build Bundle(s)/APK(s) > Build APK(s)` gives you an
   installable `.apk`. To publish on the Play Store you'll need a signed
   `.aab` bundle and a $25 one-time Google Play developer account.
5. **iOS:** `npm run ios` opens the project in Xcode (Mac only). From there:
   `Product > Archive` to build. To publish on the App Store you'll need an
   Apple Developer account ($99/year).

## Making changes later

Any time you edit the site files inside `www/`, run:
```
npx cap sync
```
to push the changes into the native Android/iOS projects before rebuilding.

## Notes

- App name and package ID are set in `capacitor.config.json`
  (`org.enugudiocese.portal`) — change these before you publish if you'd
  like a different bundle identifier.
- External links (Facebook, Vatican News) already open fine — Capacitor
  handles `target="_blank"` links via the system browser.
- If you'd rather have something installable straight from the browser with
  no app-store process at all, ask about turning this into a PWA instead —
  much faster path, works on both Android and iPhone home screens.
