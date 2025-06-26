# Goaldn

Goaldn is a modern React Native application with Windows support, built with a focus on performance, maintainability, and user experience. The project leverages the latest React Native features and a comprehensive set of tools for cross-platform development.

## Features

- **Cross-Platform Support**: Built with React Native, supporting both mobile and Windows platforms
- **Modern UI Components**: Utilizes a rich set of UI primitives and components
- **Internationalization**: Built-in support for multiple languages using i18next
- **State Management**: Uses Jotai for efficient state management
- **Styling**: Implements NativeWind (Tailwind CSS for React Native) for consistent styling
- **Navigation**: Comprehensive navigation system using React Navigation
- **BLE Support**: Built-in Bluetooth Low Energy support
- **File System Operations**: Native file system integration
- **PDF Generation**: Support for PDF creation and printing
- **Gesture Handling**: Advanced gesture support with React Native Gesture Handler
- **Animations**: Smooth animations powered by React Native Reanimated

## Prerequisites

- Node.js (LTS version recommended)
- React Native development environment setup
- Windows development environment (for Windows support)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd goaldn
```

2. Install dependencies:
```bash
npm install
```

3. Install peer dependencies:
```bash
npm install @react-native-async-storage/async-storage @react-native-community/blur @react-native-community/slider @react-navigation/bottom-tabs @react-navigation/drawer @react-navigation/native @react-navigation/native-stack @rn-primitives/popover @rn-primitives/slot @rn-primitives/switch @rn-primitives/toggle @rn-primitives/toggle-group @rn-primitives/types babel-plugin-module-resolver class-variance-authority clsx form-atoms i18next jotai lucide-react-native nativewind react react-dom react-i18next react-native react-native-ble-manager react-native-css-interop react-native-fs react-native-gesture-handler react-native-html-to-pdf react-native-localize react-native-permissions react-native-print react-native-reanimated react-native-safe-area-context react-native-screens react-native-share react-native-svg react-native-windows tailwind-merge tailwindcss
```

## Development

### Running the Application

For Windows:
```bash
npm run windows
```

For Android:
```bash
npm run android
```

For iOS:
```bash
npm run ios
```

### Development Tools

- **TypeScript**: The project uses TypeScript for type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework

## Project Structure

```
goaldn/
├── lib/              # Core application code
├── node_modules/     # Dependencies
├── .eslintrc.js     # ESLint configuration
├── .prettierrc.js   # Prettier configuration
├── components.json  # Component configuration
├── global.css       # Global styles
├── jest.config.js   # Jest configuration
├── package.json     # Project dependencies and scripts
└── tsconfig.json   # TypeScript configuration
```

## Testing

Run tests using Jest:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms of the license included in the repository.

## Support

For support and questions, please open an issue in the repository.
