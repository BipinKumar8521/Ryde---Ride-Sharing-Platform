# Ride Sharing App

A modern ride-sharing mobile application built with React Native and Expo.

## Features

- User authentication and registration
- Real-time location tracking
- Driver matching and booking
- Payment integration
- Ride history
- Map integration with OlaMaps

## Tech Stack

- **Frontend**: React Native, Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL)
- **Maps**: React Native Maps with OlaMaps API
- **Location Services**: OlaMaps Autocomplete & Directions API
- **Payment**: Razorpay
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add your environment variables.
   Copy `.env.example` to `.env` and fill in your API keys:

   ```bash
   cp .env.example .env
   ```

   **Required API Keys:**
   - **OlaMaps API Key**: Get from [OlaMaps Developer Console](https://maps.olacabs.com/)
   - **Clerk API Key**: For authentication
   - **Neon Database URL**: For PostgreSQL database
   - **Razorpay API Keys**: For payment processing

3. Start the development server:

   ```bash
   npm start
   ```

4. Run on specific platform:

   ```bash
   npm run ios    # for iOS
   npm run android # for Android
   ```

## Project Structure

```text
app/
├── (api)/          # API routes
├── (auth)/         # Authentication screens
└── (root)/         # Main app screens
components/         # Reusable UI components
constants/          # App constants and configurations
lib/               # Utility functions
types/             # TypeScript type definitions
assets/            # Images, icons, and fonts
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
