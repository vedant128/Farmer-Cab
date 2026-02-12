# FarmerCab 🚜

FarmerCab is a peer-to-peer farming equipment rental platform designed to connect farmers who need equipment with those who have idle machinery. Built with React Native and Expo, it facilitates easy renting, booking, and management of agricultural assets.

## 🌟 Features

### 🚜 For Renters
- **Browse Equipment**: View a wide range of farming machinery available for rent.
- **Map View**: Find equipment near your location using an interactive map.
- **Advanced Filtering**: Filter listings by distance and type.
- **Flexible Booking**: Rent equipment by the hour or day.
- **Wallet System**: Integrated wallet for seamless payments.
- **Subsidy Information**: Access information about government agricultural subsidies.

### 🌾 For Owners
- **Post Rentals**: Easily list your tractors, harvesters, and other equipment.
- **Manage Listings**: View and remove your active listings.
- **Earn Money**: Track your earnings through the transaction history.

### 👤 User Profile
- **Profile Management**: Update your personal details and profile picture.
- **Transaction History**: Keep track of all your wallet deposits and rental payments.
- **My Listings**: Quick access to manage your posted equipment.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 54)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Maps**: `react-native-maps`, `expo-location`
- **UI/Styling**: `expo-linear-gradient`, `@expo/vector-icons`, Custom Styles
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your physical device OR Android Emulator / iOS Simulator
- Firebase project setup (see Configuration)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/vedant128/Farmer-Cab.git
    cd Farmer-Cab
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the application**
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator**
    - Scan the QR code with the **Expo Go** app (Android/iOS).
    - Press `a` for Android Emulator.
    - Press `i` for iOS Simulator.

## ⚙️ Configuration

This project uses Firebase for backend services. You need to configure your `firebaseConfig.js` file with your own Firebase credentials.

1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** and **Firestore Database**.
3.  Get your web configuration object.
4.  Update `firebaseConfig.js` (or `.env` if configured) with your keys.

## 📱 Project Structure

```
farmer-code/
├── app/                 # Expo Router screens and pages
│   ├── (auth)/          # Authentication routes
│   ├── index.tsx        # Entry point
│   ├── rent.tsx         # Main rental marketplace
│   ├── profile.tsx      # User profile
│   └── ...
├── components/          # Reusable UI components
├── assets/              # Images and fonts
├── contexts/            # React Contexts (UserLocation, etc.)
└── firebaseConfig.js    # Firebase configuration
```

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built for the farming community.*
