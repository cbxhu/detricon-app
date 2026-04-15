# Detricon Webview Wrapper

This project is a high-performance webview wrapper for [Detricon Messenger](https://detricon-messenger.vercel.app/).

## Features
- **PWA Support**: Can be "installed" on Android/iOS/Desktop directly from the browser.
- **Splash Screen**: Professional loading experience.
- **Offline Detection**: Graceful handling of connectivity issues.
- **Native-like UI**: Minimalist wrapper that lets the content shine.

## How to Install on Android (PWA Method)
1. Open the App URL in **Google Chrome** on your Android device.
2. Tap the three dots (menu) in the top right corner.
3. Select **"Add to Home screen"** or **"Install app"**.
4. Detricon will now appear in your app drawer and behave like a native app.

## How to Build a Native APK (Advanced)
If you specifically need a `.apk` file, you can use **Capacitor** with this project:

1. Install dependencies:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Initialize Capacitor:
   ```bash
   npx cap init
   ```
3. Build the web project:
   ```bash
   npm run build
   ```
4. Add Android platform:
   ```bash
   npx cap add android
   ```
5. Open in Android Studio to build the APK:
   ```bash
   npx cap open android
   ```

## Configuration
The target URL is configured in `src/App.tsx`.
Current target: `https://detricon-messenger.vercel.app/`
