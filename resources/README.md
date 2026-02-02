# App Icon & Splash Screen Resources

This folder contains source assets for generating app icons and splash screens.

## Required Files

### App Icon
Create a file named `icon.png`:
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency support
- **Content**: Your app icon (a tile/grid design would match the app theme)

### Splash Screen
Create a file named `splash.png`:
- **Size**: 2732x2732 pixels (to support all device sizes)
- **Format**: PNG
- **Content**: Centered logo on solid background (#1a1a2e recommended)

## Generating Assets

Once you have the source images, use `@capacitor/assets` to generate all required sizes:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

This will automatically create:
- All iOS icon sizes (29x29 to 1024x1024)
- All Android icon sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Adaptive icons for Android 8+
- Splash screens for all device sizes

## Manual Alternative

If you prefer to create icons manually, place them in:

### Android
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### iOS
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Design Tips

For a Tile Calculator app, consider:
- A grid pattern representing tiles
- Clean geometric shapes
- Colors: Use your brand colors or a professional blue/teal
- Keep it simple - icons are small on device screens
