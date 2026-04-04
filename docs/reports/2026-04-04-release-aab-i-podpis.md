# Release AAB и подготовка upload-ключа

## Что изменено

- В `android/app/build.gradle` добавлена загрузка `android/keystore.properties`: при наличии файла release-сборка подписывается **upload keystore**; если файла нет, поведение как раньше — **debug**-подпись для локальных проверок.
- В корневой `.gitignore` добавлены `android/keystore.properties` и шаблон игнорирования `*.jks`.
- Добавлен шаблон `android/keystore.properties.example` с комментарием и примером вызова `keytool`.
- В чеклисте [Google Play (RU/ID/TR/JP)](../2026-04-04-google-play-publishing-ru-id-tr-jp.md) отмечена выполненная задача **GP-B1** и уточнены примечания к **GP-B2**.

## Что проверено

- Команда `.\gradlew.bat bundleRelease` (из каталога `android/`, без daemon) завершилась успешно.
- Сформирован артефакт: `android/app/build/outputs/bundle/release/app-release.aab`.
- Дополнительно в `outputs` есть release APK: `android/app/build/outputs/apk/release/prod-calendar-release.apk`.

## Дальнейшие шаги

- Создать **upload keystore** (например PKCS12 `.jks`), скопировать `keystore.properties.example` → `keystore.properties`, заполнить пароли и путь к файлу, пересобрать `bundleRelease` — так AAB будет готов к загрузке в Play под схему **Play App Signing**.
- В Play Console при первой загрузке включить **Play App Signing** и следовать мастеру регистрации upload-ключа.
- После перехода на upload-ключ снова прогнать smoke-тест установки release-сборки на устройстве.
