# BuzzIt Mobile - Expo Version

React Native mobile app for BuzzIt using Expo and NativeBase.

## Testing the App (Quick Start!)

### Prerequisites

- Node.js installed
- **Expo Go app** on your phone (download from Play Store or App Store)

### Installation & Running

1. **Navigate to the app directory:**

   ```bash
   cd app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   or

   ```bash
   pnpm install
   ```

3. **Start Expo:**

   ```bash
   npx expo start
   ```

4. **Test on your phone:**
   - **Android**: Scan the QR code with Expo Go app
   - **iOS**: Scan the QR code with Camera app (it will open in Expo Go)

That's it! The app will load on your phone instantly.

## Features

✅ User Authentication (Email/Password)  
✅ Social Feed with Posts  
✅ Create Posts with Photos  
✅ Like, Repost, Comment, Share  
✅ Games via WebView  
✅ Real-time updates with Firebase

## Tech Stack

- **Framework**: Expo ~51.0 / React Native 0.74.5
- **UI**: NativeBase 3.4.28
- **Navigation**: React Navigation 6.x
- **Backend**: Firebase (web SDK)
- **Image Handling**: Expo Image Picker

## Project Structure

```
app/
├── App.js              # Root component
├── app.json            # Expo configuration
├── src/
│   ├── screens/        # App screens
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── functions/      # Firebase functions
│   ├── hooks/          # Custom React hooks
│   ├── config/         # Firebase config
│   └── theme/          # NativeBase theme
└── .env                # Environment variables
```

## Development

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser

## Firebase Configuration

Firebase credentials are stored in `.env` file:

- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- etc.

## Next Steps

- Complete Profile screen
- Implement PostDetails with comments
- Build Messaging system
- Add Notifications
- Implement Search
- Add more games

## Troubleshooting

**Can't scan QR code?**

- Make sure your phone and computer are on the same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`

**App won't load?**

- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## License

Private - BuzzIt Project
