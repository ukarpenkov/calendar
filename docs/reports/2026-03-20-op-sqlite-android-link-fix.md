# Отчет: Android fix для `op-sqlite`

Дата: `2026-03-20`

Источник задачи: runtime-ошибка Android после подключения `@op-engineering/op-sqlite`

## Что было сделано

Исправлена Android runtime-ошибка `Base module not found`, возникавшая при вызове `NativeModules.OPSQLite`.

## Причина

- `npx react-native config` видел `@op-engineering/op-sqlite`
- но сгенерированный `android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java` не включал `OPSQLitePackage`
- из-за этого модуль не регистрировался в приложении, и `NativeModules.OPSQLite` оставался `null`

## Изменения

- `android/app/src/main/java/com/calendar/MainApplication.kt`
  - добавлен ручной импорт `com.op.sqlite.OPSQLitePackage`
  - пакет добавлен в `PackageList(this).packages.apply { ... }` как временный fallback на случай сбоя autolinking

## Что проверено

- `npx react-native config` подтверждает наличие Android-конфига у `@op-engineering/op-sqlite`
- `npm run android -- --no-packager --port 8083`
- Android build завершился успешно
- APK установлен на эмулятор и приложение запущено

## Результат

Нативный пакет `OPSQLite` теперь включается в Android-приложение даже при проблемном autolinking, что разблокирует bootstrap `SQLite` и дальнейшую работу приложения.
