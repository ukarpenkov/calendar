# Release AAB 2.0 для Google Play

## Что изменено

- В `android/app/build.gradle` обновлена версия Android-релиза: `versionCode` повышен до `2`, `versionName` изменён на `2.0`.
- Существующая release-подпись через `android/keystore.properties` использована без дополнительных изменений, поэтому сборка остаётся пригодной для загрузки в Google Play Console.
- Изменение выполнено в рамках подготовки следующей публикации после ранее настроенной схемы release/AAB-подписи.

## Что проверено

- Из каталога `android/` успешно выполнена команда `.\gradlew.bat bundleRelease`.
- Сборка завершилась статусом `BUILD SUCCESSFUL`.
- Сформирован артефакт `android/app/build/outputs/bundle/release/app-release.aab`.
- Дополнительно подтверждено, что в `android/app/build.gradle` зафиксирована версия `2.0` для этой сборки.

## Дальнейшие шаги

- Загрузить `android/app/build/outputs/bundle/release/app-release.aab` в дорожку closed testing в Google Play Console.
- В карточке релиза проверить, что Play Console показывает ожидаемую версию приложения и корректно принимает новый `versionCode`.
- После загрузки пройти smoke-проверку сборки через приглашённого тестировщика на Android-устройстве.
