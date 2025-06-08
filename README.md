# Precision Farming Dashboard

A modern web application for monitoring and controlling precision farming operations using drone technology.

## Features

- Real-time drone monitoring and control
- Interactive map visualization with stress detection
- Live image feed from drone cameras
- Mission status timeline
- Test mode for development and demonstration
- Live mode for production deployment

## Tech Stack

- React 18 + Vite 4
- TypeScript
- Tailwind CSS
- Framer Motion
- React Leaflet
- Firebase (Realtime Database + Storage)
- WebSocket/Socket.io

## Prerequisites

- Node.js 16+
- npm 7+
- Firebase project setup

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd precision-farming-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
  ├── components/     # React components
  ├── services/      # Firebase and API services
  ├── utils/         # Helper functions
  ├── App.tsx        # Main application component
  └── main.tsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 