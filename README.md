# 📅 Calendar — Your Year, On Device

A **React Native** mobile app for **Android** that shows a full **production calendar** at a glance: workdays, weekends, holidays, and shortened days — with monthly summaries and **no account or cloud** required.

---

## ✨ What it does

- 🗓 **Year overview** — see the whole year on one screen; tap a month for detail and totals (working days, non-working days, hours for a 40-hour week).
- ✨ **Motion** — subtle **animations** for transitions and interactions so the UI feels responsive without getting in the way.
- 🖼 **Date imagery** — **custom images** for notable dates (holidays, themes), so days are easier to spot at a glance.
- 🌙 **Comfortable viewing** — **light** and **dark** themes so you can read the calendar anywhere.
- 🌍 **Bilingual UI** — interface oriented toward **Russian** and **English** usage.
- 📥 **Bring your own year** — import a validated **local JSON** file to replace the active calendar; the app ships with a bundled **2026** dataset so the first launch always has real data.
- 🔒 **Privacy by design** — **client-only**: no backend, no sync, no sign-in. Everything stays on the device.

---

## 🎯 Why this app stands out

| | |
| --- | --- |
| 📴 **Offline-first** | Calendar data lives in **SQLite** on the phone; you are not tied to connectivity. |
| ✅ **Strict validation** | Imported JSON is checked before it replaces your data — bad files are rejected with clear feedback. |
| 🔄 **Predictable updates** | Importing a new year **replaces** the current dataset in one coherent step (with confirmation), not a messy merge. |
| 🧱 **Maintainable codebase** | **TypeScript**, explicit domain types, and **Feature-Sliced Design** under `src/` keep features easy to find and evolve. |

---

## 🛠 Tech stack

| Layer | Choice |
| --- | --- |
| **Framework** | [React Native](https://reactnative.dev/) **0.84** |
| **Language** | **TypeScript** |
| **UI runtime** | **React 19** |
| **Local database** | **SQLite** via [`@op-engineering/op-sqlite`](https://github.com/OP-Engineering/op-sqlite) — canonical store for the active year |
| **Import** | Local **JSON** → validate → write to SQLite |
| **Files** | [`@react-native-documents/picker`](https://github.com/react-native-documents/picker), [`@dr.pogodin/react-native-fs`](https://github.com/birdofpreyru/react-native-fs) |
| **Graphics** | [`react-native-svg`](https://github.com/software-mansion/react-native-svg) |
| **Layout** | [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context) |
| **Tooling** | **Metro**, **Jest**, **ESLint**, **Prettier** |
| **Node** | **≥ 22.11** (see `engines` in `package.json`) |

---

## 🏗 Project layout

- `src/` — app code in **FSD** style: `app`, `pages`, `widgets`, `features`, `entities`, `shared`
- `android/` — native Android project (no Expo workflow)
- Bundled calendar data and import contracts live alongside domain and persistence layers (see `docs/` for the full product plan)

---

## 🚀 Quick start

```bash
npm install
npm run android
```

On **Windows**, `npm run android` runs `scripts/run-android.cjs`, which fills in `JAVA_HOME`, `ANDROID_HOME`, and SDK tool paths when your terminal does not (common in some IDE-integrated shells). **Fully quit and reopen the editor** after changing system environment variables, or rely on this script.

---

## 💻 Development: Metro and the Android app

In **debug** builds the native app loads JavaScript from **Metro**, not from a file inside the APK. If Metro is stopped or unreachable, you may see a red screen like **“Unable to load script.”**

Use **two terminals** while developing:

1. **Terminal 1 — Metro (keep it running)**

   ```bash
   npm start
   ```

2. **Terminal 2 — install / run Android**

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

---

## 🧪 Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start Metro bundler |
| `npm run android` | Build and run on Android (with Windows-friendly env helper) |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint |

---

## 📄 License & docs

See repository metadata for license (if present). For architecture and roadmap details, see [`docs/GLOBAL-DEVELOPMENT-PLAN.md`](docs/GLOBAL-DEVELOPMENT-PLAN.md).

---

<p align="center">
  <sub>Built with ☕ and clarity — your calendar, your device, your rules.</sub>
</p>
