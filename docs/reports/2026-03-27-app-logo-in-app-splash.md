# Отчёт: та же иконка при запуске и в UI

## Что изменено

- **`AppLogo`** (`src/shared/ui/AppLogo.tsx`): вместо векторной отрисовки на `react-native-svg` используется растровый `require('../../../assets/launcher-icon-source.png')` — тот же файл, что и для Android `ic_launcher_full`. Режим `withPlate` оставлен только как внешний отступ (фон «тарелки» убран: он уже внутри картинки).
- **Нативный экран до React Native**: в `AppTheme` добавлен `android:windowBackground` → `drawable/splash_screen.xml` (заливка `ic_launcher_background` + по центру `ic_launcher_full`).
- **Android 12+ (API 31)**: в `values-v31/styles.xml` заданы `windowSplashScreenBackground`, `windowSplashScreenAnimatedIcon` и `windowSplashScreenIconBackgroundColor`, чтобы системный splash совпадал с артом лаунчера.

## Что проверено

- `eslint` для `AppLogo.tsx`, `npm test` (все 10 suites), `:app:assembleDebug`.

## Дальнейшие шаги

- При смене иконки обновить `assets/launcher-icon-source.png`, перегенерировать PNG через `scripts/generate-launcher-pngs.ps1` и при необходимости подправить `ic_launcher_background`.
