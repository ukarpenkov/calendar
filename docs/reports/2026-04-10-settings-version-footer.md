# Версия в настройках (раздел «О приложении»)

## Что изменено

- В карточке «О приложении» добавлена строка `AboutLine`: метка `settings.about.version`, значение — `APP_DISPLAY_VERSION` из `src/shared/config/appDisplayVersion.ts` (сейчас `3.0`).
- Ключ `settings.footerVersion` удалён; для подписи версии используется `settings.about.version` во всех локалях (en, ru, ja, tr, id).
- В `android/app/build.gradle` для релиза 3.0 заданы `versionCode` 3 и `versionName` `"3.0"`.

## Что проверено

- Ранее: ESLint для затронутых TS-файлов.

## Дальнейшие шаги

- При следующем релизе обновлять одновременно `APP_DISPLAY_VERSION` и `versionName` / `versionCode` в Gradle.
