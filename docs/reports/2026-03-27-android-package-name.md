# Смена Android package name на com.prodyk.calendar

## Что изменено

- В `android/app/build.gradle` обновлены `namespace` и `applicationId` на `com.prodyk.calendar`.
- Классы `MainActivity` и `MainApplication` перенесены в пакет `com.prodyk.calendar` (`java/com/prodyk/calendar/`), старые файлы в `com/calendar` удалены.

## Что проверено

- Поиск по репозиторию: других вхождений `com.calendar` в исходниках (вне `android/app/build`) не осталось.
- `AndroidManifest.xml` использует относительные имена `.MainActivity` / `.MainApplication` — они корректно резолвятся через `namespace`.

## Дальнейшие шаги

- После смены `applicationId` это уже **другое** приложение для Android: при установке рядом со старой сборкой появится второй ярлык; для магазина нужен новый listing или осознанная миграция пользователей.
- Рекомендуется локально выполнить `cd android && ./gradlew assembleRelease` (или эквивалент на Windows) для проверки сборки.

### Кэш autolinking (React Native)

Плагин RN кладёт конфиг в `android/build/generated/autolinking/autolinking.json` и **не пересобирает его** при изменении только `namespace` / `applicationId` в `build.gradle` (слежение за `package-lock.json` и т.п.). После смены package name при ошибке вида «package com.old does not exist» в `ReactNativeApplicationEntryPoint.java` нужно удалить этот JSON (или папку `android/build/generated/autolinking/`) и снова запустить Gradle — тогда выполнится `npx @react-native-community/cli config` и подтянется новый `packageName`.
