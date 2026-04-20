# Обновление версии до 5.0

## Что изменено
- В `android/app/build.gradle` обновлена Android-версия релиза: `versionCode` увеличен до `5`, `versionName` изменен на `5.0`.
- В `src/shared/config/appDisplayVersion.ts` отображаемая версия в настройках обновлена с `4.0` на `5.0`.
- Версии в сборщике и в экране настроек синхронизированы для подготовки нового релиза.

## Что проверено
- Подтверждено, что в `android/app/build.gradle` зафиксированы значения `versionCode 5` и `versionName "5.0"`.
- Подтверждено, что в `src/shared/config/appDisplayVersion.ts` задано `APP_DISPLAY_VERSION = '5.0'`.

## Дальнейшие шаги
- Перед публикацией собрать `release`-артефакт (`AAB`) и проверить, что Google Play Console принимает новый `versionCode`.
