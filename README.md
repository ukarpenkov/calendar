# calendar

React Native 0.84 app (Android-focused). Source lives under `src/`.

```bash
npm install
npm run android
```

On Windows, `npm run android` runs `scripts/run-android.cjs`, which fills in `JAVA_HOME`, `ANDROID_HOME`, and SDK tool paths when your terminal does not (common with some IDE-integrated shells). Fully quit and reopen the editor after changing system environment variables, or rely on this script.

## Development: Metro and the Android app

In debug builds the native app loads JavaScript from **Metro**, not from a file inside the APK. If Metro is stopped or unreachable, you get a red screen such as **“Unable to load script.”**

Use **two terminals** while developing:

1. **Terminal 1 — Metro (keep it running):**

   ```bash
   npm start
   ```

2. **Terminal 2 — install / run Android:**

   ```bash
   npm run android
   ```

### Matching the dev server port

`react-native run-android` bakes the bundler port into the native build (via `react-native run-android --port …`). **Metro must listen on the same port** as the last install you used.

- If you installed with a custom port, start Metro on that port and reinstall so everything stays aligned:

  ```bash
  npm start -- --port 8083
  npm run android -- --port 8083
  ```

- **Simplest reset:** stop extra Metro / Node processes so **8081** is free, then use defaults everywhere:

  ```bash
  npm start
  npm run android
  ```

  Do **not** pass `--port` on either command unless you intend to keep using that port consistently.

After Metro is up, use **Reload** on the device (or press `R` twice in the Metro terminal) if the app was already open.
