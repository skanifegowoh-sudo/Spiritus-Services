#!/bin/bash
# Run this on your own computer (not in this sandbox) after unzipping the project.
# Requires: Node.js 18+, and for Android: Android Studio; for iOS: a Mac with Xcode.

set -e

echo "Installing dependencies..."
npm install

echo "Initializing Capacitor (safe to ignore 'already exists' messages)..."
npx cap init "Enugu Diocese Portal" "org.enugudiocese.portal" --web-dir=www || true

echo "Adding Android platform..."
npx cap add android

echo "Adding iOS platform (only works on macOS)..."
npx cap add ios || echo "Skipped iOS (needs macOS + Xcode)"

echo "Syncing web assets into native projects..."
npx cap sync

echo ""
echo "Done. Next steps:"
echo "  - Android: npm run android   (opens Android Studio, then Build > Build APK/Bundle)"
echo "  - iOS:     npm run ios       (opens Xcode, then Product > Archive)"
