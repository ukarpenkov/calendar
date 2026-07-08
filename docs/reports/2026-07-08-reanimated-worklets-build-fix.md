# Исправление сборки Reanimated / worklets

## Что изменено

- В `babel.config.js` плагин `react-native-reanimated/plugin` заменён на `react-native-worklets/plugin` (требование Reanimated 4; плагин должен быть последним).
- Зависимость `react-native-worklets@0.10.2` уже была в `package.json` и совместима с `react-native-reanimated@4.5.1` — функционал анимаций не менялся.
- Для успешной release-сборки очищены устаревшие каталоги `.cxx` (битый CMake-кэш после предыдущих сборок).

## Что проверено

- `./gradlew projects` видит `:react-native-worklets` среди autolinked-модулей.
- `./gradlew assembleRelease` завершился успешно (`BUILD SUCCESSFUL`).
- Нативные задачи `:react-native-worklets:*` и `:react-native-reanimated:*` проходят без ошибки «library not found».

## Дальнейшие шаги

- При локальной разработке после смены native-зависимостей при необходимости снова удалять `android/app/.cxx` и `.cxx` у native-модулей, если CMake ссылается на несуществующие пути в Gradle transforms.
- После изменений Babel — перезапуск Metro с `--reset-cache`, чтобы worklets-трансформации применились к JS-бандлу.
