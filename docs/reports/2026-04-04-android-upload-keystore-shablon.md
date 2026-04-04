# Android: upload keystore и шаблон keystore.properties

## Что изменено

- Добавлен файл `android/keystore.properties.example` с полями `storeFile`, `storePassword`, `keyPassword`, `keyAlias` и краткими инструкциями (генерация `keytool`, проверка отпечатка, напоминание про Play App Signing).
- В `android/app/build.gradle` для `signingConfigs.release` при наличии `keystore.properties` добавлена проверка обязательных полей и существования файла keystore; при ошибке выводится понятное сообщение со ссылкой на шаблон.
- В `docs/2026-04-04-google-play-publishing-ru-id-tr-jp.md` для задачи **GP-B2** отмечено выполнение со стороны репозитория и уточнено, что генерация `.jks` и включение Play App Signing остаются шагами при релизе.

## Что проверено

- Логика Gradle до изменений уже подключала `android/keystore.properties` и при его отсутствии оставляла `release` на debug-подписи; это поведение сохранено.
- `.gitignore` уже исключает `android/keystore.properties`, `*.jks`, `*.keystore`.

## Дальнейшие шаги

- Локально: скопировать `keystore.properties.example` → `keystore.properties`, выполнить `keytool` для `app/upload-release.jks` (или свой путь в `storeFile`), сохранить пароли и резервную копию keystore.
- В Google Play Console при первой загрузке AAB включить **Play App Signing** и зарегистрировать upload-ключ согласно мастеру консоли.
