<div align="center">
<img width="1200" height="475" alt="SplitShare Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SplitShare

A modern expense splitting and group expense management application built with React, TypeScript, and Firebase.

## Features

- 📊 **Dashboard** - Overview of your expenses and balances
- 👥 **Groups** - Create and manage expense groups with friends
- 💰 **Expenses** - Add, split, and track shared expenses
- 🤝 **Settle Up** - Track and settle debts between friends
- 📈 **Analytics** - Visualize spending patterns
- 👤 **Friends** - Manage your friends list

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Firebase (Firestore, Authentication)
- **Mobile**: Capacitor (Android)
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shyamnath-Sankar/SplitShare.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore and Authentication
   - Copy `.env.example` to `.env.local` and add your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

### Building for Android

```bash
npm run build
npx cap sync android
npx cap open android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── pages/          # Page components
├── utils/          # Utility functions
├── firebase.ts     # Firebase configuration
├── types.ts        # TypeScript types
└── App.tsx         # Main app component
```

## License

MIT
