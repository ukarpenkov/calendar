# Reanimated-анимация сворачивания месяца

## Что изменено

- Анимация открытия и сворачивания месячного экрана переведена с `Animated` API на `react-native-reanimated`: `useSharedValue`, `useAnimatedStyle`, `withTiming` на UI thread для плавного высокого FPS.
- При закрытии экран сворачивается в правый нижний угол; `onBack` вызывается после завершения анимации через `runOnJS`.
- Экспериментальные `sharedTransitionTag` / `FadeIn` / `FadeOut` не используются — только ручная transform-анимация, чтобы не воспроизводить release-крэш.
- Параллакс горизонтального свайпа между месяцами оставлен на `Animated` + `FlatList` (отдельный путь, не затрагивает sheet transition).

## Что проверено

- `npm test -- --testPathPattern=monthDetail` — 7 тестов проходят.
- IDE diagnostics для `MonthDetailScreen.tsx` — без замечаний.

## Дальнейшие шаги

- Проверить на устройстве плавность сворачивания (60/120 FPS) и отсутствие краша в release APK.
- При необходимости подстроить длительность `OPEN_DURATION_MS` / `CLOSE_DURATION_MS`.
