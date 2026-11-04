
# Production Calendar

An offline-first Android application built with React Native and TypeScript for viewing and managing production calendars.

The application provides an annual overview of working days, weekends, public holidays, and shortened working days. It includes monthly statistics and supports importing custom calendar datasets from local JSON files.

All data is stored locally on the device. The application does not require an account, backend service, or internet connection.

## Features

- **Annual calendar** — full-year overview with navigation to individual months.
- **Monthly statistics** — working days, non-working days, and calculated working hours based on a 40-hour workweek.
- **Day classification** — visual distinction between working days, weekends, public holidays, and shortened working days.
- **Custom date illustrations** — images associated with selected holidays and notable dates.
- **UI animations** — animated transitions and interactions.
- **Theme support** — light and dark appearance modes.
- **Localization** — Russian and English interfaces.
- **JSON import** — import custom production calendar datasets from local files.
- **Offline storage** — persistent calendar data stored in SQLite.

The application includes a bundled production calendar for 2026, available immediately after installation.

## Tech Stack

| Component | Technology |
| --- | --- |
| Framework | React Native 0.84 |
| UI | React 19 |
| Language | TypeScript |
| Database | SQLite (`@op-engineering/op-sqlite`) |
| File selection | `@react-native-documents/picker` |
| File system | `@dr.pogodin/react-native-fs` |
| Graphics | `react-native-svg` |
| Safe area handling | `react-native-safe-area-context` |
| Bundler | Metro |
| Testing | Jest |
| Code quality | ESLint, Prettier |
| Runtime requirement | Node.js >= 22.11 |

## Architecture

The project follows **Feature-Sliced Design (FSD)** principles, separating application initialization, pages, widgets, features, domain entities, and shared functionality.

### Project Structure

```text
.
├── android/              # Native Android project
├── docs/                 # Project documentation
├── scripts/              # Development utilities
└── src/
    ├── app/              # Application initialization
    ├── pages/            # Application screens
    ├── widgets/          # Composite UI components
    ├── features/         # Application features
    ├── entities/         # Domain entities
    └── shared/           # Shared utilities and components
```

The project uses the React Native CLI workflow without Expo.

### Data Persistence

SQLite serves as the primary storage for the active production calendar.

On initial launch, the application uses the bundled 2026 dataset.

Calendar data can subsequently be replaced through a local JSON import.

The import process follows these steps:

1. Select a JSON file from the device.
2. Validate the file against the expected data structure.
3. Reject invalid data and display an error.
4. Request confirmation before replacing the existing calendar.
5. Write the validated dataset to SQLite.

Importing a calendar replaces the active dataset rather than merging it with existing records.

No remote API, synchronization service, or user authentication is required.

## Getting Started

### Prerequisites

- Node.js >= 22.11
- npm
- JDK and Android SDK configured for React Native development
- Android emulator or physical Android device

### Installation

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npm start
```

In a separate terminal, build and launch the Android application:

```bash
npm run android
```

### Windows Environment

On Windows, `npm run android` invokes `scripts/run-android.cjs`.

The script configures `JAVA_HOME`, `ANDROID_HOME`, and Android SDK tool paths when they are unavailable in the current terminal environment.

After modifying system environment variables, restart the terminal or IDE to ensure the changes are applied.

## Development

### Metro Bundler

Android debug builds load the JavaScript bundle from Metro rather than embedding it directly in the APK.

Metro must be running and accessible from the Android emulator or device.

If Metro is unavailable, the application may display an `Unable to load script` error.

### Custom Metro Port

The Metro server and Android build must use the same port.

For example, to use port `8083`:

Start Metro:

```bash
npm start -- --port 8083
```

Build and run Android:

```bash
npm run android -- --port 8083
```

The React Native CLI configures the bundler port during the native build. Changing the Metro port may require reinstalling the application.

The default port is `8081`.

To return to the default configuration, stop conflicting Metro processes and run:

```bash
npm start
npm run android
```

After Metro starts, reload the application if it is already running.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Metro development server |
| `npm run android` | Build, install, and launch the Android application |
| `npm test` | Execute Jest tests |
| `npm run lint` | Run ESLint checks |

## Documentation

Additional information about the architecture, implementation, and development roadmap is available in:

[Global Development Plan](docs/GLOBAL-DEVELOPMENT-PLAN.md)

## Distribution

The Android application is available on Google Play:

[Production Calendar — Google Play](https://play.google.com/store/apps/details?id=com.prodyk.calendar)

## License

Refer to the repository metadata for licensing information, if available.
